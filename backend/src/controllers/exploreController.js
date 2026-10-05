const pool = require("../db");

// Get all explore items
const getAllExploreItems = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM explore_items ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi getAllExploreItems:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Create new explore item
const createExploreItem = async (req, res) => {
  const { title, description, img, icon, detail, has_video, video_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO explore_items (title, description, img, icon, detail, has_video, video_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, img, icon, detail, has_video, video_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi createExploreItem:", err);
    res.status(500).json({ message: "Lỗi khi tạo mục mới" });
  }
};

// Update explore item
const updateExploreItem = async (req, res) => {
  const { id } = req.params;
  const { title, description, img, icon, detail, has_video, video_url } = req.body;
  try {
    const result = await pool.query(
      "UPDATE explore_items SET title=$1, description=$2, img=$3, icon=$4, detail=$5, has_video=$6, video_url=$7 WHERE id=$8 RETURNING *",
      [title, description, img, icon, detail, has_video, video_url, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Không tìm thấy mục này" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi updateExploreItem:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật mục" });
  }
};

// Delete explore item
const deleteExploreItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM explore_items WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Không tìm thấy mục này" });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("Lỗi deleteExploreItem:", err);
    res.status(500).json({ message: "Lỗi khi xóa mục" });
  }
};

module.exports = {
  getAllExploreItems,
  createExploreItem,
  updateExploreItem,
  deleteExploreItem
};
