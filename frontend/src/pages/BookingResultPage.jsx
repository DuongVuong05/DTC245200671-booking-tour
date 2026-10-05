import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, FileText, Search, Clock } from 'lucide-react';

const STATUS_VIEW = {
  Pending: {
    icon: <Clock size={80} color="#d97706" />,
    title: 'Yêu cầu đặt tour đã được ghi nhận',
    desc: 'Đơn của bạn đang chờ xác nhận và chờ thanh toán. Nhân viên Vuo Travel sẽ liên hệ hướng dẫn thanh toán trong thời gian sớm nhất.',
  },
  Confirmed: {
    icon: <CheckCircle size={80} color="#1A7055" />,
    title: 'Đặt Tour Thành Công!',
    desc: 'Đơn của bạn đã được xác nhận. Hãy sẵn sàng cho hành trình Kinh Bắc sắp tới!',
  },
  Completed: {
    icon: <CheckCircle size={80} color="#1A7055" />,
    title: 'Chuyến đi đã hoàn thành',
    desc: 'Cảm ơn bạn đã đồng hành cùng Vuo Travel. Hẹn gặp lại ở những hành trình tiếp theo!',
  },
  Cancelled: {
    icon: <Clock size={80} color="#64748b" />,
    title: 'Đơn đặt tour đã bị hủy',
    desc: 'Đơn này không còn hiệu lực. Nếu cần hỗ trợ, vui lòng liên hệ Vuo Travel.',
  },
};

const BookingResultPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;

  const orderCode = booking?.id ? `KB-${booking.id}` : null;
  const totalPrice = booking?.total_price != null ? Number(booking.total_price).toLocaleString('vi-VN') : null;
  const numPeople = booking?.num_people;
  const status = booking?.status || 'Pending';
  const view = STATUS_VIEW[status] || STATUS_VIEW.Pending;

  // Refresh trang làm mất state -> không bịa ra "thành công", hướng dẫn tra cứu thay vào đó
  if (!booking) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', padding: '1rem'}}>
        <div style={{background: 'white', padding: '3rem', borderRadius: '16px', textAlign: 'center', maxWidth: '600px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)'}}>
          <Search size={64} color="#0284c7" style={{margin: '0 auto 1.5rem'}} />
          <h2 style={{fontSize: '1.8rem', color: '#1e293b', margin: '0 0 1rem 0'}}>Không tìm thấy thông tin đơn hàng</h2>
          <p style={{color: '#64748b', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.5rem'}}>
            Nếu bạn vừa đặt tour, hãy tra cứu lại bằng Mã đơn và Số điện thoại để xem trạng thái mới nhất.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/tra-cuu" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', backgroundColor: 'var(--primary-dark)', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>
              <Search size={18}/> Tra cứu đơn hàng
            </Link>
            <Link to="/tours" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold'}}>
              <FileText size={18}/> Xem thêm tour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', padding: '1rem'}}>
      <div style={{background: 'white', padding: '3rem', borderRadius: '16px', textAlign: 'center', maxWidth: '600px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)'}}>
        <div style={{margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center'}}>{view.icon}</div>
        <h2 style={{fontSize: '2rem', color: '#1e293b', margin: '0 0 1rem 0'}}>{view.title}</h2>
        <p style={{color: '#64748b', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1rem'}}>
          {view.desc}
        </p>

        <p style={{color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1rem'}}>
          Cảm ơn bạn đã lựa chọn <strong>Vuo Travel</strong>.
          {orderCode && (<> Mã đơn hàng của bạn là <strong>{orderCode}</strong>.</>)}
        </p>

        <div style={{
          display: 'inline-block', textAlign: 'left', background: '#f8fafc', borderRadius: '12px',
          padding: '1rem 1.5rem', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.8', color: '#334155', width: '100%'
        }}>
          {numPeople != null && <div>Số lượng khách: <strong>{numPeople} người</strong></div>}
          {totalPrice != null && <div>Tổng tiền: <strong style={{color: '#e11d48'}}>{totalPrice}đ</strong></div>}
          <div>Trạng thái: <strong>{status === 'Pending' ? 'Chờ xác nhận / Chờ thanh toán' : status}</strong></div>
        </div>

        {/* Mời khách đặt thêm khách sạn (Cross-selling) */}
        {(status === 'Pending' || status === 'Confirmed') && (
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '12px', padding: '20px', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px',
            border: '1px solid #bae6fd', textAlign: 'left'
          }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛎️ Đặt thêm khách sạn?
              </h3>
              <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Hoàn thiện chuyến đi của bạn với các lựa chọn lưu trú đẳng cấp nhất tại Kinh Bắc.
              </p>
            </div>
            <Link to="/hotels" style={{
              whiteSpace: 'nowrap', padding: '10px 20px', background: '#0284c7', color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem',
              boxShadow: '0 4px 10px rgba(2,132,199,0.3)'
            }}>
              Xem phòng ngay
            </Link>
          </div>
        )}

        <p style={{color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem'}}>
          Bạn có thể tra cứu lại đơn này bất cứ lúc nào bằng Mã đơn và Số điện thoại.
        </p>

        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <Link to="/" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold'}}>
            <Home size={18}/> Về Trang Chủ
          </Link>
          <Link to="/profile" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold'}}>
            <FileText size={18}/> Đơn của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingResultPage;
