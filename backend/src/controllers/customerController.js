const pool = require("../db");

const getAllCustomers = async (req, res) => {
  try {
    // Không trả về password_hash
    const result = await pool.query("SELECT id, full_name, email, phone, address, created_at FROM customers");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

const createCustomer = async (req, res) => {
  const { full_name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO customers (full_name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [full_name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

// Khách hàng tự cập nhật hồ sơ (không cho đổi email — email là định danh đăng nhập)
const updateMe = async (req, res) => {
  const customerId = req.user.id;
  const { full_name, phone, address } = req.body;

  if (!full_name || !String(full_name).trim()) {
    return res.status(400).json({ error: "Họ tên không được để trống." });
  }
  if (!phone || !String(phone).trim()) {
    return res.status(400).json({ error: "Số điện thoại không được để trống." });
  }

  try {
    const result = await pool.query(
      "UPDATE customers SET full_name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING id, full_name, email, phone, address",
      [String(full_name).trim(), String(phone).trim(), address || "", customerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }
    res.json({ message: "Cập nhật hồ sơ thành công.", user: result.rows[0] });
  } catch (error) {
    console.error("Lỗi updateMe:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = { getAllCustomers, createCustomer, updateMe };
