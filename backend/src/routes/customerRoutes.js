const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

const { authenticateToken, authenticateCustomer, requireRole } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, requireRole(['admin', 'staff']), customerController.getAllCustomers);
router.post("/", authenticateToken, requireRole(['admin', 'staff']), customerController.createCustomer);

// Khách hàng tự cập nhật hồ sơ
router.put("/me", authenticateCustomer, customerController.updateMe);

module.exports = router;
