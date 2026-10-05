const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { loginLimiter, authLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);
router.post('/verify-otp', loginLimiter, authController.verifyOtp);

// Only admin can manage staff
router.post('/register', authenticateToken, requireRole(['admin']), authLimiter, authController.register);
router.get('/users', authenticateToken, requireRole(['admin']), authController.getAllUsers);
router.put('/users/:id', authenticateToken, requireRole(['admin']), authController.updateUser);
router.put('/users/:id/role', authenticateToken, requireRole(['admin']), authController.updateUserRole);
router.delete('/users/:id', authenticateToken, requireRole(['admin']), authController.deleteUser);

// Customer auth routes
router.post('/customer/login', loginLimiter, authController.customerLogin);
router.post('/customer/register', authLimiter, authController.customerRegister);
router.post('/customer/logout', authController.customerLogout);

module.exports = router;
