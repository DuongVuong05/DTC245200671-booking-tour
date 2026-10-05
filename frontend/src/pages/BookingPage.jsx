import { API_BASE } from '../config';
import { getLocalUser } from '../api';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Users, CheckCircle } from 'lucide-react';
import './BookingPage.css';

// Lọc lịch khởi hành còn khả dụng (ngày chưa qua và còn chỗ)
const getAvailableSchedules = (schedules) => {
  if (!Array.isArray(schedules)) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return schedules.filter((s) => {
    const dep = new Date(s.departure_date);
    return !isNaN(dep.getTime()) && dep >= today && Number(s.available_seats) > 0;
  });
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tourId = id;

  const [tour, setTour] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [numPeople, setNumPeople] = useState(2);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ fullName: '', email: '', phone: '' });

  // Validate từng trường ngay khi người dùng rời khỏi ô nhập (không đợi đến lúc submit)
  const validateField = (field, value) => {
    const v = String(value || '').trim();
    if (!v) {
      setFieldErrors((prev) => ({ ...prev, [field]: 'Trường này là bắt buộc.' }));
      return false;
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email không đúng định dạng (ví dụ: ten@email.com).' }));
      return false;
    }
    if (field === 'phone' && !/(0|\+84)(3|5|7|8|9)\d{8}$/.test(v.replace(/\s/g, ''))) {
      setFieldErrors((prev) => ({ ...prev, phone: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84).' }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    return true;
  };

  // Thông tin khách hàng (đọc 1 lần — tránh object mới mỗi render gây loop useEffect)
  const [customerUser] = useState(() => getLocalUser('customerUser'));
  const [fullName, setFullName] = useState(customerUser ? customerUser.full_name : '');
  const [email, setEmail] = useState(customerUser ? customerUser.email : '');
  const [phone, setPhone] = useState(customerUser ? customerUser.phone : '');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  // Promotion
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    // Nếu chưa đăng nhập -> chuyển về trang đăng nhập kèm đường dẫn quay lại
    if (!customerUser) {
      navigate(`/login?redirect=/booking/${tourId}`);
      return;
    }
    if (!tourId) {
      setLoadError('Thiếu thông tin tour. Vui lòng quay lại danh sách tour.');
      setLoading(false);
      return;
    }

    // Lấy thông tin Tour + lịch trình từ Backend
    fetch(`${API_BASE}/api/tours/${tourId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải thông tin tour (HTTP ' + res.status + ')');
        return res.json();
      })
      .then((data) => {
        setTour(data);
        const available = getAvailableSchedules(data.schedules);
        setSchedules(available);
        setSelectedSchedule(available.length > 0 ? available[0] : null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải thông tin đặt tour:', err);
        setLoadError('Không thể tải thông tin tour. Vui lòng thử lại sau.');
        setLoading(false);
      });
  }, [customerUser, navigate, tourId]);

  const pricePerPerson = tour ? Number(tour.price) : 0;
  const subtotal = pricePerPerson * numPeople;

  // Mức giảm giá thực tế (lấy từ backend API; backend tự tính lại giá cuối cùng khi tạo booking)
  const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const totalPrice = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`${API_BASE}/api/promotions/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), booking_value: subtotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAppliedPromo(data);
    } catch (err) {
      setPromoError(err.message);
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  // Re-validate promo nếu số khách thay đổi (giá trị đơn hàng đổi)
  useEffect(() => {
    if (appliedPromo) {
      handleApplyPromo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) {
      setErrorMsg('Vui lòng chọn lịch trình khởi hành.');
      return;
    }
    // Validate toàn bộ trước khi gửi
    const okName = validateField('fullName', fullName);
    const okEmail = validateField('email', email);
    const okPhone = validateField('phone', phone);
    if (!okName || !okEmail || !okPhone) {
      setErrorMsg('Vui lòng kiểm tra lại các trường được đánh dấu bên dưới.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tour_schedule_id: selectedSchedule.id,
          full_name: fullName,
          email: email,
          phone: phone,
          address: address,
          note: note,
          num_people: numPeople,
          total_price: totalPrice,
          promotion_id: appliedPromo ? appliedPromo.id : null,
        }),
      });

      // Phiên đăng nhập hết hạn -> quay lại login rồi về lại trang booking
      if (response.status === 401) {
        navigate(`/login?redirect=/booking/${tourId}`);
        return;
      }

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || 'Đặt tour thất bại. Vui lòng thử lại.');
      }

      // Chỉ chuyển trang kết quả khi backend đã xác nhận tạo đơn thành công
      navigate('/booking-success', { state: { booking: result, tour } });
    } catch (err) {
      console.error('Lỗi đặt tour:', err);
      setErrorMsg(err.message || 'Đặt tour thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '50px 0', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  }

  if (loadError) {
    return (
      <div className="booking-page">
        <div className="booking-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', maxWidth: '500px' }}>
            <p style={{ color: '#e11d48', marginBottom: '20px' }}>{loadError}</p>
            <button className="btn-confirm-pay" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/tours')}>
              Quay lại danh sách tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">

        {/* Left Content */}
        <div className="booking-main">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20}/> Quay lại
          </button>

          <h1 className="booking-title">Xác nhận đặt tour</h1>

          {errorMsg && (
            <div role="alert" style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Your Trip */}
          <section className="booking-section">
            <h2>1. Chọn Lịch trình & Số lượng khách</h2>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                <Calendar size={16} inline /> Lịch khởi hành:
              </label>
              {schedules.length > 0 ? (
                <select
                  className="form-control"
                  value={selectedSchedule ? selectedSchedule.id : ''}
                  onChange={(e) => {
                    const sched = schedules.find(s => s.id === parseInt(e.target.value, 10));
                    setSelectedSchedule(sched);
                  }}
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      Ngày khởi hành: {new Date(s.departure_date).toLocaleDateString('vi-VN')} - Chỗ còn lại: {s.available_seats} (HDV: {s.guide_name || 'Đang cập nhật'})
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ color: '#666' }}>Chưa có lịch khởi hành khả dụng. Vui lòng quay lại sau hoặc liên hệ Admin.</p>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                <Users size={16} inline /> Số lượng khách:
              </label>
              <input
                type="number"
                min="1"
                max={selectedSchedule ? selectedSchedule.available_seats : 30}
                value={numPeople}
                onChange={(e) => {
                  const maxSeats = selectedSchedule ? selectedSchedule.available_seats : 30;
                  const val = parseInt(e.target.value, 10) || 1;
                  // Chặn đặt quá số ghế còn lại
                  setNumPeople(Math.min(maxSeats, Math.max(1, val)));
                }}
                className="form-control"
              />
            </div>
          </section>

          {/* Customer Information */}
          <section className="booking-section">
            <h2>2. Thông tin người đặt</h2>
            <div className="payment-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  aria-label="Họ và tên"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); if (fieldErrors.fullName) validateField('fullName', e.target.value); }}
                  onBlur={() => validateField('fullName', fullName)}
                  required
                />
                {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <input
                    type="email"
                    placeholder="Địa chỉ Email *"
                    aria-label="Địa chỉ Email"
                    className="form-control"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) validateField('email', e.target.value); }}
                    onBlur={() => validateField('email', email)}
                    required
                  />
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>
                <div className="form-group half">
                  <input
                    type="tel"
                    placeholder="Số điện thoại *"
                    aria-label="Số điện thoại"
                    className="form-control"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (fieldErrors.phone) validateField('phone', e.target.value); }}
                    onBlur={() => validateField('phone', phone)}
                    required
                  />
                  {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Địa chỉ liên hệ"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Ghi chú (yêu cầu đặc biệt, điểm đón, ...)"
                  className="form-control"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="booking-section">
            <h2>3. Thanh toán</h2>

            <div style={{ padding: '15px', background: '#f0fdf4', color: '#166534', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bbf7d0' }}>
              <Info size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              Sau khi đặt tour, đơn của bạn ở trạng thái <strong>Chờ xác nhận</strong>. Nhân viên Vuo Travel sẽ liên hệ hướng dẫn thanh toán bằng <strong>Chuyển khoản / Tiền mặt</strong>.
            </div>

            <form className="payment-form" onSubmit={handleBooking}>
              <p className="terms-text">
                Bằng việc chọn nút bên dưới, tôi đồng ý với các Quy định của Vuo Travel, Điều khoản & Điều kiện, và Chính sách Bảo mật.
              </p>

              <button
                type="submit"
                className="btn-confirm-pay"
                disabled={submitting || schedules.length === 0}
              >
                {submitting ? 'ĐANG XỬ LÝ...' : `Xác nhận & Đặt tour (${totalPrice.toLocaleString('vi-VN')}đ)`}
              </button>
            </form>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="booking-sidebar">
          <div className="order-summary-card">

            {/* Item Info */}
            <div className="item-info">
              <div className="item-img" style={{backgroundImage: `url('${tour ? tour.image_url : ''}')`}}></div>
              <div className="item-details">
                <span className="item-type">Tour {tour ? tour.duration : ''} • {tour ? tour.destination : ''}</span>
                <h4 className="item-name">{tour ? tour.name : ''}</h4>
                {selectedSchedule && (
                  <div className="item-rating" style={{ fontWeight: 400 }}>
                    <Calendar size={14}/> Khởi hành: {new Date(selectedSchedule.departure_date).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            </div>

            <hr className="divider-light" />

            {/* Price Details */}
            <div className="price-details">
              <h3>Chi tiết giá</h3>

              <div className="price-row">
                <span>{pricePerPerson.toLocaleString('vi-VN')}đ x {numPeople} khách</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="promo-section" style={{ margin: '15px 0' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode}
                    style={{ padding: '8px 15px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Áp dụng
                  </button>
                </div>
                {promoError && <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '5px' }}>{promoError}</div>}
                {appliedPromo && <div style={{ color: '#16a34a', fontSize: '13px', marginTop: '5px' }}>{appliedPromo.message}</div>}
              </div>

              <div className="price-row text-green">
                <span>Khuyến mãi {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                <span>- {discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>

              <hr className="divider-light" />

              <div className="price-total">
                <span>Tổng (VND)</span>
                <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="cancellation-policy">
              <CheckCircle size={14} style={{ color: '#16a34a', inline: true }} /> Hủy miễn phí trước 24 giờ khởi hành.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
