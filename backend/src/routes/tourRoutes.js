const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTourById);

// Protected routes (admin & staff)
router.post("/", authenticateToken, requireRole(['admin', 'staff']), tourController.createTour);
router.put("/:id", authenticateToken, requireRole(['admin', 'staff']), tourController.updateTour);
router.delete("/:id", authenticateToken, requireRole(['admin', 'staff']), tourController.deleteTour);

module.exports = router;
