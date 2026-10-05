const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', guideController.getAllGuides);
router.get('/:id', guideController.getGuideById);
router.post('/', authenticateToken, requireRole(['admin']), guideController.createGuide);
router.put('/:id', authenticateToken, requireRole(['admin']), guideController.updateGuide);
router.delete('/:id', authenticateToken, requireRole(['admin']), guideController.deleteGuide);

module.exports = router;
