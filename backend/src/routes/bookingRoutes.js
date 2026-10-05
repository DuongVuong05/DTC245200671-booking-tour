const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateToken, authenticateCustomer, requireRole } = require("../middleware/authMiddleware");
const { bookingLimiter } = require("../middleware/rateLimiter");

// Admin/Staff routes (ketoan = kế toán: chỉ xem danh sách + thống kê, không đổi trạng thái)
router.get("/", authenticateToken, requireRole(['admin', 'staff', 'ketoan']), bookingController.getAllBookings);
router.get("/stats", authenticateToken, requireRole(['admin', 'staff', 'ketoan']), bookingController.getDashboardStats);
router.put("/:id/status", authenticateToken, requireRole(['admin', 'staff']), bookingController.updateBookingStatus);

// Customer route — chỉ nhận customer_token (không xung đột với cookie admin)
router.get("/my-bookings", authenticateCustomer, requireRole(['customer']), bookingController.getCustomerBookings);

// Tra cứu đơn công khai theo Mã đơn + SĐT (không cần đăng nhập, có rate limit chống dò)
router.get("/lookup", bookingLimiter, bookingController.lookupBooking);

// Khách hàng hủy đơn của chính mình (chỉ khi đơn còn Pending)
router.post("/:id/cancel", authenticateCustomer, bookingController.cancelBooking);

// Đặt tour yêu cầu đăng nhập khách hàng (khớp UX frontend) — chống chiếm ghế/spam email
router.post("/", authenticateCustomer, bookingLimiter, bookingController.createBooking);

module.exports = router;
