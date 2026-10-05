import { API_BASE } from '../config';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Ticket } from 'lucide-react';
import './LookupPage.css';

const STATUS_LABEL = {
  Pending: 'Chờ xác nhận / Chờ thanh toán',
  Confirmed: 'Đã xác nhận',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
};

const LookupPage = () => {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) {
      setError('Vui lòng nhập Mã đơn và Số điện thoại đã dùng khi đặt tour.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/lookup?code=${encodeURIComponent(code.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tra cứu thất bại.');
      setResult(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lookup-page">
      <div className="lookup-container">
        <h1 className="lookup-title">Tra cứu đơn đặt tour</h1>
        <p className="lookup-subtitle">
          Nhập Mã đơn (ví dụ: KB-123) và Số điện thoại đã dùng khi đặt tour để xem trạng thái đơn của bạn.
        </p>

        <form className="lookup-form" onSubmit={handleLookup}>
          <div className="lookup-field">
            <Ticket size={18} className="lookup-icon" />
            <input
              type="text"
              placeholder="Mã đơn (KB-...)"
              aria-label="Mã đơn"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="lookup-field">
            <Search size={18} className="lookup-icon" />
            <input
              type="tel"
              placeholder="Số điện thoại đặt tour"
              aria-label="Số điện thoại đặt tour"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button type="submit" className="lookup-btn" disabled={loading}>
            {loading ? 'ĐANG TRA CỨU...' : 'TRA CỨU ĐƠN'}
          </button>
        </form>

        {error && <div className="lookup-error" role="alert">⚠️ {error}</div>}

        {result && (
          <div className="lookup-result">
            <h2>Thông tin đơn hàng</h2>
            <div className="lookup-result-grid">
              <div className="lookup-item"><span className="lookup-label">Mã đơn</span><strong>KB-{result.id}</strong></div>
              <div className="lookup-item">
                <span className="lookup-label">Trạng thái</span>
                <span className={`lookup-status lookup-status-${String(result.status).toLowerCase()}`}>
                  {STATUS_LABEL[result.status] || result.status}
                </span>
              </div>
              <div className="lookup-item"><span className="lookup-label">Tour</span><strong>{result.tour_name}</strong></div>
              <div className="lookup-item">
                <span className="lookup-label"><MapPin size={14} inline /> Điểm đến</span>
                <strong>{result.destination || '—'}</strong>
              </div>
              <div className="lookup-item">
                <span className="lookup-label"><Calendar size={14} inline /> Ngày khởi hành</span>
                <strong>{new Date(result.departure_date).toLocaleDateString('vi-VN')}</strong>
              </div>
              <div className="lookup-item">
                <span className="lookup-label"><Users size={14} inline /> Số khách</span>
                <strong>{result.num_people} người</strong>
              </div>
              <div className="lookup-item">
                <span className="lookup-label">Tổng tiền</span>
                <strong className="lookup-price">{Number(result.total_price).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="lookup-item">
                <span className="lookup-label">Người đặt</span>
                <strong>{result.customer_name} — {result.phone}</strong>
              </div>
            </div>
            <p className="lookup-note">
              Đơn đang ở trạng thái <strong>Chờ xác nhận</strong> sẽ được nhân viên liên hệ hướng dẫn thanh toán. Để xem chi tiết hoặc hủy đơn, vui lòng{' '}
              <Link to="/login?redirect=/profile">đăng nhập tài khoản đã đặt tour</Link>.
            </p>
          </div>
        )}

        <p className="lookup-help">
          Cần hỗ trợ thêm? <Link to="/lien-he">Liên hệ Vuo Travel</Link>
        </p>
      </div>
    </div>
  );
};

export default LookupPage;
