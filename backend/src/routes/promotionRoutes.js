const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");
const { promoLimiter } = require("../middleware/rateLimiter");

// Admin routes
router.get("/", authenticateToken, requireRole(['admin', 'staff']), promotionController.getAllPromotions);
router.post("/", authenticateToken, requireRole(['admin', 'staff']), promotionController.createPromotion);
router.put("/:id", authenticateToken, requireRole(['admin', 'staff']), promotionController.updatePromotion);
router.delete("/:id", authenticateToken, requireRole(['admin', 'staff']), promotionController.deletePromotion);

// Public route for customers to check code
router.post("/apply", promoLimiter, promotionController.applyPromotion);

module.exports = router;
