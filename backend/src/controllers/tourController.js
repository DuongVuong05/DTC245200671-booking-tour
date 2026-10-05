const pool = require("../db");

// Lấy danh sách toàn bộ tour; ?featured=true chỉ lấy tour nổi bật (trang chủ)
const getAllTours = async (req, res) => {
  try {
    if (req.query.featured === 'true') {
      const result = await pool.query(
        "SELECT * FROM tours WHERE is_featured = TRUE ORDER BY created_at ASC"
      );
      return res.json(result.rows);
    }
    const result = await pool.query("SELECT * FROM tours ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getAllTours:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Lấy thông tin 1 tour theo ID kèm danh sách lịch trình khả dụng
const getTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const tourResult = await pool.query("SELECT * FROM tours WHERE id = $1", [id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thông tin tour này." });
    }

    const tour = tourResult.rows[0];

    // Lấy thêm danh sách lịch trình khả dụng của tour này
    const scheduleResult = await pool.query(
      "SELECT * FROM tour_schedules WHERE tour_id = $1 ORDER BY departure_date ASC",
      [id]
    );

    tour.schedules = scheduleResult.rows;
    res.json(tour);
  } catch (error) {
    console.error("Lỗi getTourById:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Thêm tour mới
const createTour = async (req, res) => {
  const {
    name, description, destination, price, duration, image_url,
    included, excluded, policy, gallery,
    is_featured, old_price, discount, rating, rating_count, schedule_note, vehicle, hotel
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Vui lòng nhập Tên Tour và Giá Tour." });
  }

  try {
    let result;
    try {
      result = await pool.query(
        `INSERT INTO tours (name, description, destination, price, duration, image_url,
           included, excluded, policy, gallery,
           is_featured, old_price, discount, rating, rating_count, schedule_note, vehicle, hotel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
        [
          name,
          description || "",
          destination || "Bắc Ninh",
          parseFloat(price),
          duration || "1 Ngày",
          image_url || "https://images.unsplash.com/photo-1596404987702-861c8535048d?auto=format&fit=crop&q=80&w=500",
          included || null,
          excluded || null,
          policy || null,
          gallery || null,
          is_featured ? true : false,
          old_price ? parseFloat(old_price) : null,
          discount || null,
          rating ? parseFloat(rating) : null,
          rating_count ? parseInt(rating_count, 10) : 0,
          schedule_note || null,
          vehicle || null,
          hotel || null
        ]
      );
    } catch (insertErr) {
      // DB đang chạy chưa migration cột mới (add_tour_columns.js) — thử lại không kèm cột mới
      if (insertErr.code !== '42703') throw insertErr;
      result = await pool.query(
        "INSERT INTO tours (name, description, destination, price, duration, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          name,
          description || "",
          destination || "Bắc Ninh",
          parseFloat(price),
          duration || "1 Ngày",
          image_url || "https://images.unsplash.com/photo-1596404987702-861c8535048d?auto=format&fit=crop&q=80&w=500"
        ]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi createTour:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Cập nhật thông tin tour
const updateTour = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, destination, price, duration, image_url,
    included, excluded, policy, gallery,
    is_featured, old_price, discount, rating, rating_count, schedule_note, vehicle, hotel
  } = req.body;

  try {
    let result;
    try {
      result = await pool.query(
        `UPDATE tours
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             destination = COALESCE($3, destination),
             price = COALESCE($4, price),
             duration = COALESCE($5, duration),
             image_url = COALESCE($6, image_url),
             included = COALESCE($7, included),
             excluded = COALESCE($8, excluded),
             policy = COALESCE($9, policy),
             gallery = COALESCE($10, gallery),
             is_featured = COALESCE($11, is_featured),
             old_price = COALESCE($12, old_price),
             discount = COALESCE($13, discount),
             rating = COALESCE($14, rating),
             rating_count = COALESCE($15, rating_count),
             schedule_note = COALESCE($16, schedule_note),
             vehicle = COALESCE($17, vehicle),
             hotel = COALESCE($18, hotel)
         WHERE id = $19 RETURNING *`,
        [
          name, description, destination, price ? parseFloat(price) : null, duration, image_url,
          included, excluded, policy, gallery,
          is_featured === undefined ? null : Boolean(is_featured),
          old_price ? parseFloat(old_price) : null,
          discount, rating ? parseFloat(rating) : null,
          rating_count ? parseInt(rating_count, 10) : null,
          schedule_note, vehicle, hotel, id
        ]
      );
    } catch (updateErr) {
      // DB đang chạy chưa migration cột mới (add_tour_columns.js) — thử lại không kèm cột mới
      if (updateErr.code !== '42703') throw updateErr;
      result = await pool.query(
        `UPDATE tours
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             destination = COALESCE($3, destination),
             price = COALESCE($4, price),
             duration = COALESCE($5, duration),
             image_url = COALESCE($6, image_url)
         WHERE id = $7 RETURNING *`,
        [name, description, destination, price ? parseFloat(price) : null, duration, image_url, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tour cần cập nhật." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi updateTour:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Xóa tour
const deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM tours WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tour cần xóa." });
    }
    res.json({ message: "Xóa tour thành công." });
  } catch (error) {
    console.error("Lỗi deleteTour:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour
};
