const rateLimit = require('express-rate-limit');

const makeLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
  });

// Đăng nhập / xác thực OTP: chống brute force
const loginLimiter = makeLimiter(10, 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.');

// Các route auth khác (register, users...)
const authLimiter = makeLimiter(30, 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.');

// Áp dụng mã giảm giá: chống dò mã
const promoLimiter = makeLimiter(20, 'Quá nhiều lần thử mã giảm giá. Vui lòng thử lại sau 15 phút.');

// Tạo đơn đặt tour
const bookingLimiter = makeLimiter(10, 'Quá nhiều yêu cầu đặt tour. Vui lòng thử lại sau 15 phút.');

module.exports = { loginLimiter, authLimiter, promoLimiter, bookingLimiter };
