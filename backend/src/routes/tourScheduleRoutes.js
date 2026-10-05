const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/tourScheduleController");

const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", scheduleController.getAllSchedules);
router.get("/tour/:tourId", scheduleController.getSchedulesByTourId);

// Protected routes
router.post("/", authenticateToken, requireRole(['admin', 'staff']), scheduleController.createSchedule);
router.put("/:id", authenticateToken, requireRole(['admin', 'staff']), scheduleController.updateSchedule);
router.delete("/:id", authenticateToken, requireRole(['admin', 'staff']), scheduleController.deleteSchedule);

module.exports = router;
