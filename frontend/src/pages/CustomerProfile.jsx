import { API_BASE, resolveImageUrl } from '../config';
import { apiFetch, getLocalUser } from '../api';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Calendar, MapPin, CheckCircle, Clock, XCircle, Ticket, Phone, Mail } from 'lucide-react';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tours');
  const navigate = useNavigate();

  // Đọc 1 lần duy nhất (tránh object mới mỗi render gây loop useEffect)
  const [customerUser, setCustomerUser] = useState(() => getLocalUser('customerUser'));

  // Form hồ sơ
  const [profileForm, setProfileForm] = useState({
    full_name: customerUser ? customerUser.full_name : '',
    phone: customerUser ? customerUser.phone : '',
    address: customerUser ? (customerUser.address || '') : '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Nút hủy đơn đang xử lý
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = () => {
    setLoading(true);
    setError(null);
    // 401 sẽ được apiFetch xử lý (redirect về /login);
    // lỗi mạng/500 chỉ hiển thị thông báo, KHÔNG xóa phiên đăng nhập
    apiFetch('/api/bookings/my-bookings', {}, { isAdmin: false })
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải lịch sử đặt tour (HTTP ' + res.status + ')');
        return res.json();
      })
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!customerUser) {
      navigate('/login');
      return;
    }
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, customerUser]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/customer/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error', err);
    }
    // Luôn xóa session phía client kể cả khi gọi API thất bại
    localStorage.removeItem('customerUser');
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!profileForm.full_name.trim()) {
      setProfileError('Họ tên không được để trống.');
      return;
    }
    if (!profileForm.phone.trim()) {
      setProfileError('Số điện thoại không được để trống.');
      return;
    }
    if (!/(0|\+84)(3|5|7|8|9)\d{8}$/.test(profileForm.phone.replace(/\s/g, ''))) {
      setProfileError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84).');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/customers/me`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      }, { isAdmin: false });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật hồ sơ thất bại.');

      // Cập nhật lại localStorage + state để header hiển thị đúng tên mới
      const updatedUser = { ...customerUser, ...data.user };
      localStorage.setItem('customerUser', JSON.stringify(updatedUser));
      setCustomerUser(updatedUser);
      setProfileMsg('Cập nhật hồ sơ thành công!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn này? Chỗ đã giữ sẽ được hoàn lại.')) return;
    setCancellingId(bookingId);
    try {
      const res = await apiFetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        credentials: 'include',
        method: 'POST',
      }, { isAdmin: false });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hủy đơn thất bại.');

      loadBookings();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Confirmed': return <span className="status-badge success"><CheckCircle size={14}/> Đã xác nhận</span>;
      case 'Pending': return <span className="status-badge warning"><Clock size={14}/> Chờ xử lý</span>;
      case 'Cancelled': return <span className="status-badge danger"><XCircle size={14}/> Đã hủy</span>;
      case 'Completed': return <span className="status-badge success"><CheckCircle size={14}/> Đã hoàn thành</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  if (!customerUser) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Đang chuyển hướng...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header-bg"></div>
      <div className="profile-container">

        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="avatar-circle">
              {customerUser.full_name ? customerUser.full_name.charAt(0).toUpperCase() : '?'}
            </div>
            <h3>{customerUser.full_name}</h3>
            <p>{customerUser.email}</p>
          </div>

          <nav className="profile-nav">
            <button
              className={`profile-nav-item ${activeTab === 'tours' ? 'active' : ''}`}
              onClick={() => setActiveTab('tours')}
            >
              <Calendar size={18}/> Tour của tôi
            </button>
            <button
              className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <User size={18}/> Thông tin cá nhân
            </button>
            <button className="profile-nav-item logout-btn" onClick={handleLogout}><LogOut size={18}/> Đăng xuất</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {activeTab === 'tours' ? (
            <>
              <h2>Lịch sử đặt Tour</h2>

              {loading ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>Đang tải...</p>
              ) : error ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#e11d48' }}>{error}. Vui lòng thử lại sau.</p>
                  <button className="btn-explore" onClick={loadBookings}>Thử lại</button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} className="empty-icon" />
                  <h3>Bạn chưa đặt tour nào</h3>
                  <p>Hãy khám phá những điểm đến tuyệt vời cùng Vuo Travel.</p>
                  <Link to="/tours" className="btn-explore">Khám phá ngay</Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-card-img" style={{backgroundImage: `url(${resolveImageUrl(booking.image_url)})`}}></div>
                      <div className="booking-card-body">
                        <div className="booking-header">
                          <h4 className="profile-tour-name">{booking.tour_name}</h4>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="booking-details">
                          <div className="detail-item">
                            <Ticket size={16} /> Mã đơn: <strong>KB-{booking.id}</strong>
                          </div>
                          <div className="detail-item">
                            <MapPin size={16} /> {booking.destination}
                          </div>
                          <div className="detail-item">
                            <Calendar size={16} /> Ngày đi: {new Date(booking.departure_date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="detail-item">
                            <User size={16} /> Khách: {booking.num_people} người
                          </div>
                        </div>

                        <div className="booking-footer">
                          <div className="booking-price">
                            Tổng tiền: <span>{Number(booking.total_price).toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div className="booking-date">
                              Đặt ngày: {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                            </div>
                            {booking.status === 'Pending' && (
                              <button
                                className="btn-cancel-booking"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? 'ĐANG HỦY...' : 'Hủy đơn'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2>Thông tin cá nhân</h2>

              {profileMsg && <div className="profile-success">{profileMsg}</div>}
              {profileError && <div className="profile-error">{profileError}</div>}

              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-form-group">
                  <label htmlFor="pf-name">Họ và tên *</label>
                  <input
                    id="pf-name"
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="pf-email"><Mail size={14} inline /> Email (không đổi được)</label>
                  <input id="pf-email" type="email" value={customerUser.email || ''} disabled />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="pf-phone"><Phone size={14} inline /> Số điện thoại *</label>
                  <input
                    id="pf-phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="pf-address"><MapPin size={14} inline /> Địa chỉ liên hệ</label>
                  <input
                    id="pf-address"
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-explore" disabled={profileSaving} style={{ border: 'none', cursor: 'pointer' }}>
                  {profileSaving ? 'ĐANG LƯU...' : 'Lưu thay đổi'}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerProfile;
