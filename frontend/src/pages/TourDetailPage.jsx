import { API_BASE } from '../config';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Map, SearchX, XCircle, FileText } from 'lucide-react';
import './TourDetailPage.css';

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

// Chuyển text nhiều dòng thành mảng các mục
const splitByLines = (text) => {
  if (!text) return [];
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

// Gallery lưu dạng chuỗi URL phân cách bằng dấu phẩy hoặc xuống dòng
const parseGallery = (gallery) => {
  if (!gallery) return [];
  return String(gallery)
    .split(/[\n,]+/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith('http') || u.startsWith('/'));
};

const TourDetailPage = () => {
  const { id } = useParams();
  const tourId = id;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [relatedTours, setRelatedTours] = useState([]);

  // Tour liên quan: lấy danh sách tour, ưu tiên cùng khu vực (cùng tỉnh đầu của destination)
  const loadRelatedTours = (currentTour) => {
    fetch(`${API_BASE}/api/tours`)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return;
        const others = data.filter((t) => t.id !== currentTour.id);
        const province = String(currentTour.destination || '').split('-')[0].trim().toLowerCase();
        const sameRegion = others.filter((t) =>
          String(t.destination || '').toLowerCase().includes(province) && province !== ''
        );
        const picked = [...sameRegion, ...others.filter((t) => !sameRegion.includes(t))].slice(0, 3);
        setRelatedTours(picked);
      })
      .catch((err) => {
        console.error('Lỗi tải tour liên quan:', err);
      });
  };

  const loadTour = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetch(`${API_BASE}/api/tours/${tourId}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        if (!res.ok) throw new Error('Không thể tải thông tin tour (HTTP ' + res.status + ')');
        return res.json();
      })
      .then((data) => {
        if (data) {
          setTour(data);
          loadRelatedTours(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải chi tiết tour:', err);
        setError('Không thể tải thông tin tour. Vui lòng thử lại sau.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (tourId) {
      loadTour();
    } else {
      setNotFound(true);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="tour-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Đang tải thông tin tour...
        </div>
      </div>
    );
  }

  // ---- Tour không tồn tại ----
  if (notFound || !tour) {
    return (
      <div className="tour-detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '16px' }}>
            <SearchX size={48} color="#94a3b8" style={{ margin: '0 auto 15px' }} />
            <h1 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '10px' }}>Không tìm thấy tour này</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Tour có thể đã ngừng bán hoặc đường dẫn không chính xác.</p>
            <Link to="/tours" className="btn-book-now" style={{ display: 'inline-block', width: 'auto', padding: '12px 28px' }}>
              Xem danh sách tour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Lỗi mạng ----
  if (error) {
    return (
      <div className="tour-detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '16px' }}>
            <p style={{ color: '#e11d48', marginBottom: '24px' }}>{error}</p>
            <button className="btn-book-now" style={{ display: 'inline-block', width: 'auto', padding: '12px 28px' }} onClick={loadTour}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Dữ liệu tour ----
  const tourName = tour.name || 'Tour Kinh Bắc';
  const basePrice = Number(tour.price) || 0;
  const tourDuration = tour.duration || 'Đang cập nhật';
  const tourDesc = tour.description || 'Hành trình hấp dẫn khám phá di sản văn hóa Kinh Bắc.';
  const tourImage = tour.image_url || 'https://images.unsplash.com/photo-1596404987702-861c8535048d?auto=format&fit=crop&q=80&w=1000';
  const displayDest = tour.destination || 'Kinh Bắc';

  const availableSchedules = getAvailableSchedules(tour.schedules);
  const includedItems = splitByLines(tour.included);
  const excludedItems = splitByLines(tour.excluded);
  const policyItems = splitByLines(tour.policy);
  const galleryImages = parseGallery(tour.gallery);

  return (
    <div className="tour-detail-page">
      <div className="container">

        {/* Hero Banner */}
        <div className="hero-tour-banner" style={{backgroundImage: `url('${tourImage}')`}}>
           <div className="hero-tour-overlay"></div>
        </div>

        <div className="detail-layout">

          {/* Left Content */}
          <div className="detail-main animate-fade-in-up delay-1">
            <div className="tour-tags">
              <span className="tag">{tourDuration}</span>
            </div>

            <h1 className="tour-title">{tourName}</h1>

            <p className="tour-intro">
              {tourDesc}
            </p>

            <div className="overview-icons">
              <div className="icon-box">
                <Calendar size={24} strokeWidth={1.5}/>
                <div>
                  <span className="label">Thời lượng</span>
                  <span className="value">{tourDuration}</span>
                </div>
              </div>
              <div className="icon-box">
                <Map size={24} strokeWidth={1.5}/>
                <div>
                  <span className="label">Điểm đến</span>
                  <span className="value">{displayDest}</span>
                </div>
              </div>
            </div>

            <hr className="divider" />

            {/* Gallery ảnh nếu có */}
            {galleryImages.length > 0 && (
              <section className="detail-section">
                <h2>Hình ảnh chuyến đi</h2>
                <div className="tour-gallery">
                  {galleryImages.map((img, idx) => (
                    <div className="gallery-item" key={idx}>
                      <img src={img} alt={`Hình ảnh ${tourName} ${idx + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="detail-section">
              <h2>Mô tả chi tiết</h2>
              <p>{tourDesc}</p>
            </section>

            {includedItems.length > 0 && (
              <>
                <hr className="divider" />
                <section className="detail-section">
                  <h2>Bao gồm</h2>
                  <div className="included-list">
                    {includedItems.map((item, idx) => (
                      <div key={idx} className="included-item">
                        <CheckCircle2 size={18} className="text-green" /> {item}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {excludedItems.length > 0 && (
              <>
                <hr className="divider" />
                <section className="detail-section">
                  <h2>Không bao gồm</h2>
                  <div className="included-list">
                    {excludedItems.map((item, idx) => (
                      <div key={idx} className="included-item">
                        <XCircle size={18} className="text-red" /> {item}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {policyItems.length > 0 && (
              <>
                <hr className="divider" />
                <section className="detail-section">
                  <h2><FileText size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Chính sách & Điều khoản</h2>
                  <div className="included-list">
                    {policyItems.map((item, idx) => (
                      <div key={idx} className="included-item" style={{ display: 'block' }}>
                        <CheckCircle2 size={18} className="text-green" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            <hr className="divider" />

            <section className="detail-section">
              <h2>Lịch khởi hành</h2>
              {availableSchedules.length > 0 ? (
                <div className="included-list">
                  {availableSchedules.map((s) => (
                    <div key={s.id} className="included-item" style={{ display: 'block', lineHeight: '1.8' }}>
                      <CheckCircle2 size={18} className="text-green" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                      Ngày {new Date(s.departure_date).toLocaleDateString('vi-VN')}
                      {s.return_date && String(s.return_date) !== String(s.departure_date)
                        ? ` → ${new Date(s.return_date).toLocaleDateString('vi-VN')}`
                        : ''}
                      {' '}• Còn {s.available_seats} chỗ • HDV: {s.guide_name || 'Đang cập nhật'}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Lịch khởi hành đang được cập nhật. Vui lòng liên hệ hotline để được tư vấn.</p>
              )}
            </section>
          </div>

          {/* Right Sidebar (Sticky Widget) */}
          <div className="detail-sidebar animate-fade-in-up delay-2">
            <div className="booking-widget">
              <h3 className="widget-duration">{tourDuration}</h3>
              <p className="widget-location">{displayDest}</p>

              <div className="widget-price">
                <span className="price-main">{basePrice.toLocaleString('vi-VN')}đ</span>
                <span className="price-currency">/ khách</span>
              </div>

              <div className="widget-meta">
                <div>
                  <Calendar size={14}/>
                  Khởi hành gần nhất:{' '}
                  <strong>
                    {availableSchedules.length > 0
                      ? new Date(availableSchedules[0].departure_date).toLocaleDateString('vi-VN')
                      : 'Đang cập nhật'}
                  </strong>
                </div>
              </div>

              <Link to={`/booking/${tourId}`} className="btn-book-now" style={{background: 'var(--primary-gradient)', border: 'none', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)'}}>ĐẶT TOUR NGAY</Link>
            </div>

            {/* Recommended Tours */}
            <div className="recommended-widget">
              <h3>Có thể bạn quan tâm</h3>
              {relatedTours.length > 0 ? (
                relatedTours.map((t) => (
                  <Link to={`/tours/${t.id}`} className="rec-card" key={t.id}>
                    <div className="rec-img" style={{ backgroundImage: `url('${t.image_url}')` }}></div>
                    <div className="rec-info">
                      <h4>{t.name}</h4>
                      <div className="rec-meta">{t.duration || ''}</div>
                      <div className="rec-price">{Number(t.price).toLocaleString('vi-VN')}đ</div>
                    </div>
                  </Link>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Khám phá thêm các hành trình khác của Vuo Travel.
                </p>
              )}
              <Link to="/tours" className="btn-book-now" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Xem tất cả tours
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
