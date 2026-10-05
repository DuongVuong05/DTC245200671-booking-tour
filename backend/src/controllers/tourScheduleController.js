const pool = require("../db");

// Lấy danh sách lịch trình kèm thông tin tour
const getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ts.id, ts.tour_id, ts.vehicle_id, ts.departure_date, ts.return_date, 
        ts.available_seats, ts.guide_name, ts.created_at, ts.image_url as schedule_image,
        t.name as tour_name, t.destination, t.price as tour_price, t.image_url as tour_image,
        v.name as vehicle_name, v.license_plate
      FROM tour_schedules ts 
      JOIN tours t ON ts.tour_id = t.id 
      LEFT JOIN vehicles v ON ts.vehicle_id = v.id
      ORDER BY ts.departure_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getAllSchedules:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Lấy lịch trình của 1 tour cụ thể
const getSchedulesByTourId = async (req, res) => {
  const { tourId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM tour_schedules WHERE tour_id = $1 ORDER BY departure_date ASC",
      [tourId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getSchedulesByTourId:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Thêm lịch trình khởi hành mới
const createSchedule = async (req, res) => {
  const { tour_id, vehicle_id, departure_date, return_date, available_seats, available_slots, guide_name, image_url } = req.body;
  const seats = parseInt(available_seats || available_slots, 10);

  if (!tour_id || !departure_date || !return_date || isNaN(seats) || seats <= 0) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin lịch trình hợp lệ (Tour, Ngày đi, Ngày về, Số chỗ > 0)." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tour_schedules (tour_id, vehicle_id, departure_date, return_date, available_seats, guide_name, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [tour_id, vehicle_id || null, departure_date, return_date, seats, guide_name || "Chưa phân công", image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi createSchedule:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Cập nhật lịch trình
const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { tour_id, vehicle_id, departure_date, return_date, available_seats, guide_name, image_url } = req.body;
  const seats = parseInt(available_seats, 10);

  try {
    const result = await pool.query(
      `UPDATE tour_schedules 
       SET tour_id = $1, vehicle_id = $2, departure_date = $3, return_date = $4, available_seats = $5, guide_name = $6, image_url = $7
       WHERE id = $8 RETURNING *`,
      [tour_id, vehicle_id || null, departure_date, return_date, seats, guide_name, image_url || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy lịch trình cần cập nhật." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi updateSchedule:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Xóa lịch trình
const deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM tour_schedules WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy lịch trình cần xóa." });
    }
    res.json({ message: "Xóa lịch trình thành công." });
  } catch (error) {
    console.error("Lỗi deleteSchedule:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

module.exports = { 
  getAllSchedules, 
  getSchedulesByTourId, 
  createSchedule,
  updateSchedule,
  deleteSchedule
};
