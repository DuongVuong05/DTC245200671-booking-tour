const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

// All routes are protected since only admin/staff manages vehicles
router.get("/", authenticateToken, requireRole(['admin', 'staff']), vehicleController.getAllVehicles);
router.get("/:id", authenticateToken, requireRole(['admin', 'staff']), vehicleController.getVehicleById);
router.post("/", authenticateToken, requireRole(['admin', 'staff']), vehicleController.createVehicle);
router.put("/:id", authenticateToken, requireRole(['admin', 'staff']), vehicleController.updateVehicle);
router.delete("/:id", authenticateToken, requireRole(['admin', 'staff']), vehicleController.deleteVehicle);

module.exports = router;
