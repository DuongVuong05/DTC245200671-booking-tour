const express = require("express");
const router = express.Router();
const exploreController = require("../controllers/exploreController");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

// Lấy danh sách (public) — dùng cho trang chủ khách hàng
router.get("/", exploreController.getAllExploreItems);

// Thêm, sửa, xóa chỉ dành cho Admin/Staff
router.post("/", authenticateToken, requireRole(['admin', 'staff']), exploreController.createExploreItem);
router.put("/:id", authenticateToken, requireRole(['admin', 'staff']), exploreController.updateExploreItem);
router.delete("/:id", authenticateToken, requireRole(['admin', 'staff']), exploreController.deleteExploreItem);

module.exports = router;
