const pool = require("../db");
const { sendBookingConfirmationEmail } = require("../utils/emailService");

// 1. Lấy tất cả các đơn đặt tour kèm thông tin khách hàng và lịch trình
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.num_people, b.total_price, b.status, b.booking_date,
        c.id as customer_id, c.full_name, c.email, c.phone, c.address,
        t.id as tour_id, t.name as tour_name, t.destination, t.price as tour_price,
        ts.id as tour_schedule_id, ts.departure_date, ts.return_date, ts.guide_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
      JOIN tours t ON ts.tour_id = t.id
      ORDER BY b.booking_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getAllBookings:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// 2. Tạo đơn đặt tour với Database Transaction an toàn (Chống overbooking & tự động tạo Khách hàng)
const createBooking = async (req, res) => {
  const { 
    tour_schedule_id, 
    customer_id, 
    full_name, 
    email, 
    phone, 
    address, 
    num_people,
    number_of_people,
    total_price,
    promotion_id,
    note
  } = req.body;

  const peopleCount = parseInt(num_people || number_of_people, 10);

  if (!tour_schedule_id || !peopleCount || peopleCount <= 0 || !total_price) {
    return res.status(400).json({ error: "Dữ liệu đặt tour không hợp lệ. Vui lòng kiểm tra lại." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 2.1. Xác định customer_id (Tạo mới hoặc Lấy ID nếu khách đã tồn tại)
    let targetCustomerId = customer_id;
    // Khách đã đăng nhập: email dùng để gửi xác nhận LUÔN là email tài khoản,
    // không tin email gửi kèm trong body (chống spam relay)
    let emailToUse = email;
    if (req.user && req.user.role === 'customer') {
      targetCustomerId = req.user.id;
      emailToUse = req.user.email || email;
    }

    if (!targetCustomerId) {
      if (!email || !full_name) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Thiếu thông tin khách hàng (Họ tên hoặc Email)." });
      }

      const existingCust = await client.query("SELECT id FROM customers WHERE email = $1", [email]);
      if (existingCust.rows.length > 0) {
        targetCustomerId = existingCust.rows[0].id;
      } else {
        const newCust = await client.query(
          "INSERT INTO customers (full_name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING id",
          [full_name, email, phone || "", address || ""]
        );
        targetCustomerId = newCust.rows[0].id;
      }
    }

    // 2.2. Khóa dòng tour_schedules, lấy giá tour thực tế và kiểm tra số chỗ trống (FOR UPDATE - Chống Race Condition & Sửa giá)
    const scheduleRes = await client.query(
      `SELECT ts.available_seats, ts.departure_date, t.price
       FROM tour_schedules ts
       JOIN tours t ON ts.tour_id = t.id
       WHERE ts.id = $1 FOR UPDATE`,
      [tour_schedule_id]
    );

    if (scheduleRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy lịch trình tour này." });
    }

    const { available_seats: availableSeats, departure_date: departureDate, price: tourPrice } = scheduleRes.rows[0];

    // Chặn đặt lịch trình đã khởi hành (ngày đi trước hôm nay)
    const depDate = departureDate ? new Date(departureDate) : null;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (depDate && !isNaN(depDate.getTime()) && depDate < todayStart) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Lịch trình này đã khởi hành. Vui lòng chọn ngày khởi hành khác." });
    }

    if (availableSeats < peopleCount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        error: `Rất tiếc, lịch trình này chỉ còn ${availableSeats} chỗ khả dụng (Bạn yêu cầu ${peopleCount} chỗ).` 
      });
    }

    // 2.3. Tính giá và kiểm tra Promotion
    let calculatedPrice = parseFloat(tourPrice) * peopleCount;
    let discountAmount = 0;
    let finalPromoId = null;

    if (promotion_id) {
      const promoRes = await client.query("SELECT * FROM promotions WHERE id = $1 FOR UPDATE", [promotion_id]);
      if (promoRes.rows.length > 0) {
        const promo = promoRes.rows[0];
        const now = new Date();
        // end_date lưu dạng timestamp đầu ngày -> mã có hiệu lực HẾT ngày end_date
        const endDate = promo.end_date ? new Date(new Date(promo.end_date).getTime() + 24 * 60 * 60 * 1000) : null;

        // Validate promotion again
        if (
          promo.is_active &&
          (!promo.start_date || new Date(promo.start_date) <= now) &&
          (!endDate || endDate > now) &&
          (!promo.usage_limit || promo.used_count < promo.usage_limit) &&
          calculatedPrice >= parseFloat(promo.min_booking_value)
        ) {
          finalPromoId = promo.id;
          if (promo.discount_type === 'percent') {
            // Phòng thủ: % giảm không vượt quá 100
            const pct = Math.min(100, Math.max(0, parseFloat(promo.discount_value)));
            discountAmount = (calculatedPrice * pct) / 100;
          } else {
            discountAmount = parseFloat(promo.discount_value);
          }
          if (discountAmount > calculatedPrice) discountAmount = calculatedPrice;

          calculatedPrice -= discountAmount;

          // Tăng lượt sử dụng
          await client.query("UPDATE promotions SET used_count = used_count + 1 WHERE id = $1", [promo.id]);
        }
      }
    }

    // 2.4. Trừ số chỗ khả dụng trong tour_schedules
    await client.query(
      "UPDATE tour_schedules SET available_seats = available_seats - $1 WHERE id = $2",
      [peopleCount, tour_schedule_id]
    );

    // 2.5. Thêm đơn đặt vào bảng bookings — trạng thái ban đầu là Pending (Chờ thanh toán),
    // khớp với nội dung email xác nhận; Admin sẽ chuyển sang Confirmed sau khi khách thanh toán
    let bookingRes;
    try {
      bookingRes = await client.query(
        "INSERT INTO bookings (customer_id, tour_schedule_id, promotion_id, num_people, total_price, discount_amount, status, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [targetCustomerId, tour_schedule_id, finalPromoId, peopleCount, calculatedPrice, discountAmount, "Pending", note ? String(note).slice(0, 1000) : null]
      );
    } catch (insertErr) {
      // DB đang chạy chưa chạy migration cột note (add_note_column.js) — thử lại không kèm note
      if (insertErr.code === '42703') {
        bookingRes = await client.query(
          "INSERT INTO bookings (customer_id, tour_schedule_id, promotion_id, num_people, total_price, discount_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [targetCustomerId, tour_schedule_id, finalPromoId, peopleCount, calculatedPrice, discountAmount, "Pending"]
        );
      } else {
        throw insertErr;
      }
    }

    await client.query("COMMIT");

    const createdBooking = bookingRes.rows[0];

    // Gửi Email Không Đồng Bộ (Không chặn response)
    if (emailToUse && full_name) {
      // Lấy thêm thông tin Tour để gửi email
      pool.query(
        "SELECT ts.departure_date, t.name FROM tour_schedules ts JOIN tours t ON ts.tour_id = t.id WHERE ts.id = $1",
        [tour_schedule_id]
      ).then(tourData => {
        if (tourData.rows.length > 0) {
          sendBookingConfirmationEmail(
            createdBooking,
            { email: emailToUse, full_name },
            tourData.rows[0]
          );
        }
      }).catch(err => console.error("Lỗi khi lấy thông tin gửi email:", err));
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi createBooking:", error);
    res.status(500).json({ error: "Lỗi xử lý đặt tour. Vui lòng thử lại sau." });
  } finally {
    client.release();
  }
};

// 3. Cập nhật trạng thái đơn đặt (Xử lý hoàn/trừ chỗ trống khi Hủy tour)
const VALID_BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Vui lòng cung cấp trạng thái mới." });
  }

  // Chỉ chấp nhận các trạng thái hợp lệ — tránh lỗi chính tả (vd 'cancelled')
  // làm sai logic hoàn/trừ ghế
  if (!VALID_BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${VALID_BOOKING_STATUSES.join(', ')}.` });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookingRes = await client.query(
      "SELECT * FROM bookings WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (bookingRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy đơn đặt tour." });
    }

    const oldBooking = bookingRes.rows[0];
    const oldStatus = oldBooking.status;

    // Chuyển sang Cancelled -> Hoàn trả lại chỗ
    if (oldStatus !== "Cancelled" && status === "Cancelled") {
      await client.query(
        "UPDATE tour_schedules SET available_seats = available_seats + $1 WHERE id = $2",
        [oldBooking.num_people, oldBooking.tour_schedule_id]
      );
    }
    // Chuyển từ Cancelled sang trạng thái khác -> Trừ bớt chỗ
    else if (oldStatus === "Cancelled" && status !== "Cancelled") {
      const schedRes = await client.query(
        "SELECT available_seats FROM tour_schedules WHERE id = $1 FOR UPDATE",
        [oldBooking.tour_schedule_id]
      );
      if (schedRes.rows.length > 0) {
        if (schedRes.rows[0].available_seats < oldBooking.num_people) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "Không đủ chỗ trống để khôi phục đơn đặt tour này." });
        }
        await client.query(
          "UPDATE tour_schedules SET available_seats = available_seats - $1 WHERE id = $2",
          [oldBooking.num_people, oldBooking.tour_schedule_id]
        );
      }
    }

    const updatedBooking = await client.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    await client.query("COMMIT");
    res.json(updatedBooking.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi updateBookingStatus:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  } finally {
    client.release();
  }
};

// 4. Lấy thông tin thống kê tổng quan cho Admin Dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalTours = await pool.query("SELECT COUNT(*) FROM tours");
    const totalBookings = await pool.query("SELECT COUNT(*) FROM bookings");
    // Doanh thu = đơn đã xác nhận/hoàn thành (thống nhất với /api/reports/dashboard)
    const totalRevenue = await pool.query("SELECT COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE status IN ('Confirmed', 'Completed')");
    const totalCustomers = await pool.query("SELECT COUNT(*) FROM customers");

    res.json({
      total_tours: parseInt(totalTours.rows[0].count, 10),
      total_bookings: parseInt(totalBookings.rows[0].count, 10),
      total_revenue: parseFloat(totalRevenue.rows[0].revenue),
      total_customers: parseInt(totalCustomers.rows[0].count, 10),
    });
  } catch (error) {
    console.error("Lỗi getDashboardStats:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// 5. Lấy các booking của 1 khách hàng cụ thể
const getCustomerBookings = async (req, res) => {
  const customerId = req.user.id;
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.num_people, b.total_price, b.status, b.booking_date,
        t.name as tour_name, t.destination, t.image_url,
        ts.departure_date, ts.return_date
      FROM bookings b
      JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
      JOIN tours t ON ts.tour_id = t.id
      WHERE b.customer_id = $1
      ORDER BY b.booking_date DESC
    `, [customerId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getCustomerBookings:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// 6. Tra cứu đơn đặt tour công khai theo Mã đơn + SĐT (không cần đăng nhập)
const lookupBooking = async (req, res) => {
  const { code, phone } = req.query;
  if (!code || !phone) {
    return res.status(400).json({ error: "Vui lòng nhập Mã đơn và Số điện thoại." });
  }

  // Mã đơn dạng KB-123 -> chỉ lấy phần số
  const bookingId = parseInt(String(code).replace(/\D/g, ''), 10);
  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ error: "Mã đơn không hợp lệ." });
  }
  const phoneDigits = String(phone).replace(/\D/g, '');
  if (!phoneDigits) {
    return res.status(400).json({ error: "Số điện thoại không hợp lệ." });
  }

  try {
    const result = await pool.query(
      `SELECT
         b.id, b.status, b.booking_date, b.num_people, b.total_price, b.discount_amount,
         c.full_name, c.phone,
         t.name as tour_name, t.destination,
         ts.departure_date, ts.return_date
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
       JOIN tours t ON ts.tour_id = t.id
       WHERE b.id = $1 AND regexp_replace(c.phone, '\\D', '', 'g') = $2`,
      [bookingId, phoneDigits]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn đặt tour khớp với thông tin đã nhập." });
    }

    const row = result.rows[0];
    // Che một phần thông tin cá nhân trong response công khai
    const maskName = (name) => {
      if (!name) return '';
      return name.charAt(0) + '***';
    };
    const maskPhone = (p) => {
      const digits = String(p || '').replace(/\D/g, '');
      if (digits.length < 7) return '***';
      return digits.slice(0, 3) + '****' + digits.slice(-2);
    };

    res.json({
      booking: {
        id: row.id,
        status: row.status,
        booking_date: row.booking_date,
        num_people: row.num_people,
        total_price: row.total_price,
        discount_amount: row.discount_amount,
        customer_name: maskName(row.full_name),
        phone: maskPhone(row.phone),
        tour_name: row.tour_name,
        destination: row.destination,
        departure_date: row.departure_date,
        return_date: row.return_date
      }
    });
  } catch (error) {
    console.error("Lỗi lookupBooking:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// 7. Khách hàng hủy đơn của chính mình (chỉ khi đơn còn Pending) — hoàn lại chỗ đã giữ
const cancelBooking = async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ error: "Mã đơn không hợp lệ." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookingRes = await client.query(
      "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 FOR UPDATE",
      [bookingId, req.user.id]
    );
    if (bookingRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy đơn đặt tour của bạn." });
    }

    const booking = bookingRes.rows[0];
    if (booking.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Chỉ có thể hủy đơn đang chờ xử lý. Vui lòng liên hệ nhân viên hỗ trợ." });
    }

    // Hoàn lại chỗ đã giữ
    await client.query(
      "UPDATE tour_schedules SET available_seats = available_seats + $1 WHERE id = $2",
      [booking.num_people, booking.tour_schedule_id]
    );

    const updated = await client.query(
      "UPDATE bookings SET status = 'Cancelled' WHERE id = $1 RETURNING *",
      [bookingId]
    );

    await client.query("COMMIT");
    res.json({ message: "Đã hủy đơn đặt tour.", booking: updated.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi cancelBooking:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllBookings,
  createBooking,
  updateBookingStatus,
  getDashboardStats,
  getCustomerBookings,
  lookupBooking,
  cancelBooking
};
