const pool = require("../db");

// Lấy danh sách tất cả phương tiện
const getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getAllVehicles:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Lấy phương tiện theo ID
const getVehicleById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phương tiện" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi getVehicleById:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

// Tạo mới phương tiện
const createVehicle = async (req, res) => {
  const { name, type, license_plate, seat_capacity, status } = req.body;
  if (!name || !license_plate || !seat_capacity) {
    return res.status(400).json({ error: "Vui lòng nhập tên, biển số và số chỗ" });
  }
  
  try {
    const result = await pool.query(
      "INSERT INTO vehicles (name, type, license_plate, seat_capacity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, type, license_plate, seat_capacity, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi createVehicle:", error);
    if (error.code === '23505') { // unique_violation
      return res.status(400).json({ error: "Biển số xe đã tồn tại" });
    }
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật phương tiện
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { name, type, license_plate, seat_capacity, status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE vehicles SET name = $1, type = $2, license_plate = $3, seat_capacity = $4, status = $5 WHERE id = $6 RETURNING *",
      [name, type, license_plate, seat_capacity, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phương tiện" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi updateVehicle:", error);
    if (error.code === '23505') {
      return res.status(400).json({ error: "Biển số xe đã tồn tại" });
    }
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

// Xóa phương tiện
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM vehicles WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phương tiện" });
    }
    res.json({ message: "Xóa phương tiện thành công", deletedVehicle: result.rows[0] });
  } catch (error) {
    console.error("Lỗi deleteVehicle:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
