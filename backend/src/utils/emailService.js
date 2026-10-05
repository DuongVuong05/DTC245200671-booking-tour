const nodemailer = require('nodemailer');

// Configure the SMTP transport
// You should set these in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

/**
 * Escape HTML để chống injection vào nội dung email
 */
const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Send Booking Confirmation Email to Customer
 * @param {Object} booking - Booking details from the database
 * @param {Object} customer - Customer details (email, name)
 * @param {Object} tour - Tour and Schedule details
 */
const sendBookingConfirmationEmail = async (booking, customer, tour) => {
  try {
    const formattedPrice = Number(booking.total_price).toLocaleString('vi-VN');
    const formattedDate = new Date(tour.departure_date).toLocaleDateString('vi-VN');

    const mailOptions = {
      from: `"Vuo Travel" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: `Xác nhận Đặt Tour Thành Công - ${tour.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">Cảm ơn bạn đã tin tưởng Vuo Travel!</h2>
          <p>Xin chào <strong>${escapeHtml(customer.full_name)}</strong>,</p>
          <p>Đơn đặt tour của bạn đã được hệ thống ghi nhận thành công. Dưới đây là thông tin chi tiết chuyến đi của bạn:</p>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">${escapeHtml(tour.name)}</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li><strong>Mã Booking:</strong> KB-${booking.id}</li>
              <li><strong>Ngày khởi hành:</strong> ${formattedDate}</li>
              <li><strong>Số lượng khách:</strong> ${booking.num_people} người</li>
              <li><strong>Tổng tiền:</strong> <span style="color: #dc2626; font-weight: bold;">${formattedPrice} VNĐ</span></li>
              <li><strong>Trạng thái:</strong> ${booking.status === 'Pending' ? 'Chờ thanh toán' : booking.status}</li>
            </ul>
          </div>
          
          <p><strong>Lưu ý về thanh toán:</strong> Bạn vui lòng hoàn tất thanh toán trước ngày khởi hành để chúng tôi giữ chỗ cho bạn.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 13px; color: #64748b; text-align: center;">
            Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>0909.123.456</strong><br/>
            Vuo Travel - Khám phá vẻ đẹp tiềm ẩn
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email xác nhận đã được gửi:', info.messageId);
    return true;
  } catch (error) {
    console.error('Lỗi khi gửi email xác nhận:', error);
    return false;
  }
};

/**
 * Send Verification Email
 */
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Vuo Travel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Mã xác thực Tài khoản Quản trị - Vuo Travel',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">Mã Xác Thực OTP</h2>
          <p>Xin chào,</p>
          <p>Tài khoản của bạn vừa được Admin cấp trên hệ thống quản trị của Vuo Travel. Để đăng nhập, vui lòng nhập mã OTP sau:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; color: #0f172a; padding: 15px 30px; border-radius: 8px; font-weight: 800; font-size: 24px; display: inline-block; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <p>Mã này dùng để xác thực quyền đăng nhập tài khoản nhân viên của bạn. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 13px; color: #64748b; text-align: center;">
            Nếu bạn không phải là người nhận yêu cầu này, vui lòng bỏ qua email.<br/>
            Vuo Travel
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email xác nhận đã được gửi:', info.messageId);
    return true;
  } catch (error) {
    console.error('Lỗi khi gửi email xác nhận:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendVerificationEmail
};
