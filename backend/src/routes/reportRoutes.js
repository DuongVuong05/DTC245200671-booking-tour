const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/dashboard", authenticateToken, requireRole(["admin", "staff", "ketoan"]), reportController.getDashboardStats);

module.exports = router;
