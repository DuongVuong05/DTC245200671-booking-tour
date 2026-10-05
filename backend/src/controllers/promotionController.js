const pool = require("../db");

// Validate dữ liệu mã giảm giá; trả về thông báo lỗi hoặc null nếu hợp lệ
const validatePromotionInput = (discount_type, discount_value) => {
  if (!['percent', 'fixed'].includes(discount_type)) {
    return "Loại giảm giá phải là 'percent' hoặc 'fixed'.";
  }
  const value = parseFloat(discount_value);
  if (isNaN(value) || value <= 0) {
    return "Giá trị giảm giá phải là số lớn hơn 0.";
  }
  if (discount_type === 'percent' && value > 100) {
    return "Giảm giá theo phần trăm không được vượt quá 100%.";
  }
  return null;
};

// Lấy tất cả mã giảm giá (Admin)
const getAllPromotions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM promotions ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi getAllPromotions:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Tạo mã giảm giá mới (Admin)
const createPromotion = async (req, res) => {
  const { code, discount_type, discount_value, min_booking_value, start_date, end_date, usage_limit, is_active } = req.body;
  
  if (!code || !discount_type || !discount_value) {
    return res.status(400).json({ error: "Vui lòng nhập mã, loại giảm giá và giá trị giảm." });
  }

  const validationError = validatePromotionInput(discount_type, discount_value);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO promotions (code, discount_type, discount_value, min_booking_value, start_date, end_date, usage_limit, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code.toUpperCase(), discount_type, discount_value, min_booking_value || 0, start_date || null, end_date || null, usage_limit || null, is_active !== undefined ? is_active : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi createPromotion:", error);
    if (error.code === '23505') {
      return res.status(400).json({ error: "Mã giảm giá này đã tồn tại." });
    }
    res.status(500).json({ error: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
};

// Cập nhật mã giảm giá (Admin)
const updatePromotion = async (req, res) => {
  const { id } = req.params;
  const { code, discount_type, discount_value, min_booking_value, start_date, end_date, usage_limit, is_active } = req.body;

  const validationError = validatePromotionInput(discount_type, discount_value);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE promotions SET 
        code = $1, discount_type = $2, discount_value = $3, min_booking_value = $4, 
        start_date = $5, end_date = $6, usage_limit = $7, is_active = $8
       WHERE id = $9 RETURNING *`,
      [code.toUpperCase(), discount_type, discount_value, min_booking_value || 0, start_date || null, end_date || null, usage_limit || null, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Không tìm thấy mã giảm giá." });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi updatePromotion:", error);
    if (error.code === '23505') return res.status(400).json({ error: "Mã giảm giá đã tồn tại." });
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

// Xóa mã giảm giá (Admin)
const deletePromotion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM promotions WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Không tìm thấy mã." });
    res.json({ message: "Đã xóa mã giảm giá." });
  } catch (error) {
    console.error("Lỗi deletePromotion:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

// Áp dụng mã giảm giá (Khách hàng)
const applyPromotion = async (req, res) => {
  const { code, booking_value } = req.body;
  if (!code || !booking_value) {
    return res.status(400).json({ error: "Thiếu mã giảm giá hoặc giá trị booking." });
  }

  try {
    const result = await pool.query("SELECT * FROM promotions WHERE code = $1", [code.toUpperCase()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mã giảm giá không hợp lệ." });
    }

    const promo = result.rows[0];

    if (!promo.is_active) {
      return res.status(400).json({ error: "Mã giảm giá đã bị khóa." });
    }

    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) {
      return res.status(400).json({ error: "Mã giảm giá chưa đến thời gian áp dụng." });
    }
    // end_date lưu dạng timestamp đầu ngày -> mã có hiệu lực HẾT ngày end_date
    const endDate = promo.end_date ? new Date(new Date(promo.end_date).getTime() + 24 * 60 * 60 * 1000) : null;
    if (endDate && endDate <= now) {
      return res.status(400).json({ error: "Mã giảm giá đã hết hạn." });
    }
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return res.status(400).json({ error: "Mã giảm giá đã hết lượt sử dụng." });
    }
    if (parseFloat(booking_value) < parseFloat(promo.min_booking_value)) {
      return res.status(400).json({ error: `Đơn hàng chưa đạt giá trị tối thiểu (${Number(promo.min_booking_value).toLocaleString('vi-VN')}đ) để áp dụng mã này.` });
    }

    // Tính tiền giảm (phòng thủ: % giảm không vượt quá 100)
    let discountAmount = 0;
    if (promo.discount_type === 'percent') {
      const pct = Math.min(100, Math.max(0, parseFloat(promo.discount_value)));
      discountAmount = (parseFloat(booking_value) * pct) / 100;
    } else {
      discountAmount = parseFloat(promo.discount_value);
    }

    // Không giảm quá tổng tiền
    if (discountAmount > booking_value) {
      discountAmount = booking_value;
    }

    res.json({
      id: promo.id,
      code: promo.code,
      discount_amount: discountAmount,
      message: 'Áp dụng mã thành công!'
    });

  } catch (error) {
    console.error("Lỗi applyPromotion:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  applyPromotion
};
