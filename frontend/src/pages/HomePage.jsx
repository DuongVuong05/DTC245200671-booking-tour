import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Play, Map, CalendarDays, FileText, CreditCard, Ticket, Clock, X, Building } from 'lucide-react';
import { API_BASE } from '../config';
import './HomePage.css';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [selectedExploreItem, setSelectedExploreItem] = useState(null);
  const [exploreItems, setExploreItems] = useState([]);
  const navigate = useNavigate();

  // Tour nổi bật lấy từ backend (admin đánh dấu is_featured) — dữ liệu thật, không mock
  const loadTours = () => {
    setLoading(true);
    setLoadError(null);

    fetch(`${API_BASE}/api/tours?featured=true`)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        setTours(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải tour nổi bật:', err);
        setTours([]);
        setLoadError('Không thể tải danh sách tour. Vui lòng thử lại.');
        setLoading(false);
      });

    // Load Explore Items — dữ liệu THẬT từ DB (quản lý ở Admin → Khám phá Bắc Ninh)
    fetch(`${API_BASE}/api/explore`)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setExploreItems(data);
        }
      })
      .catch(err => console.error("Lỗi tải explore items:", err));
  };

  useEffect(() => {
    loadTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryLoad = loadTours;

  return (
    <div className="home-page-modern">
      {/* Slogan */}
      <section className="homepage-slogan" style={{textAlign: 'center', margin: '20px 0 40px 0'}}>
        <h2 style={{fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--primary-dark)'}}>Du lịch Kinh Bắc</h2>
        <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-quote)'}}>Về miền di sản - Chạm vào văn hóa</p>
      </section>

      {/* 2. SEARCH BAR (Floating) */}
      <section className="search-floating-wrapper">
        <div className="search-box-modern glass-panel">
          <h3 className="search-title">Bạn muốn khám phá nơi nào?</h3>
          <div className="search-fields-grid">
            <div className="search-field">
              <MapPin size={20} className="field-icon"/>
              <div className="field-inputs">
                 <label htmlFor="home-search-input">Điểm đến / Tour</label>
                 <input
                   id="home-search-input"
                   type="text"
                   placeholder="Nhập điểm đến..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       navigate(`/tours?search=${encodeURIComponent(searchQuery)}`);
                     }
                   }}
                 />
              </div>
            </div>
            <button
              className="btn-search-action"
              onClick={() => {
                navigate(`/tours?search=${encodeURIComponent(searchQuery)}`);
              }}
            >
              TÌM TOUR
            </button>
          </div>
        </div>
      </section>

      {/* 3. TOUR NỔI BẬT */}
      <section className="section-padding featured-tours bg-light">
        <div className="home-container">
          <div className="section-header-center">
            <h2 className="section-title">TOUR NỔI BẬT</h2>
            <p className="section-subtitle">Những hành trình được yêu thích nhất</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Đang tải danh sách tour...</p>
          ) : loadError ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--danger)' }}>{loadError}</p>
              <button className="btn-hero-primary" style={{ marginTop: '12px' }} onClick={retryLoad}>Thử lại</button>
            </div>
          ) : tours.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              Chưa có tour nào. Mời bạn quay lại sau.
            </p>
          ) : (
            <div className="tour-grid">
              {tours.map(tour => (
                <div className="tour-card-premium" key={tour.id}>
                  <div className="tour-img-wrapper">
                    <img src={tour.image_url} alt={tour.name} loading="lazy" />
                    {tour.discount && <div className="tour-discount-badge">{tour.discount}</div>}
                  </div>
                  <div className="tour-info">
                    <h3 className="tour-name">{tour.name}</h3>
                    {tour.rating != null && (
                      <div
                        className="tour-rating"
                        aria-label={`Đánh giá ${tour.rating} trên 5 sao`}
                      >
                        {'★'.repeat(Math.round(Number(tour.rating)))}{'☆'.repeat(5 - Math.round(Number(tour.rating)))}
                        {tour.rating_count != null && <span className="rating-count">({tour.rating_count})</span>}
                      </div>
                    )}
                    <div className="tour-route">
                      <MapPin size={14} className="icon-blue" />
                      <span>{tour.destination || 'Kinh Bắc'}</span>
                    </div>

                    <div className="tour-meta-list">
                      {tour.schedule_note && <div className="meta-item"><Calendar size={14}/> Khởi Hành: {tour.schedule_note}</div>}
                      {tour.vehicle && <div className="meta-item"><span>🚌</span> Phương Tiện: {tour.vehicle}</div>}
                      {tour.hotel && <div className="meta-item"><Building size={14}/> Khách sạn {tour.hotel}</div>}
                      <div className="meta-item"><Clock size={14}/> Thời Gian: {tour.duration || '1 Ngày'}</div>
                    </div>

                    <div className="tour-footer">
                      <Link to={`/tours/${tour.id}`} className="btn-xem-them">Xem Thêm &gt;&gt;</Link>
                      <div className="price-box">
                        {tour.old_price != null && Number(tour.old_price) > Number(tour.price) && (
                          <div className="old-price">{Number(tour.old_price).toLocaleString('vi-VN')}đ</div>
                        )}
                        <div className="new-price">{Number(tour.price).toLocaleString('vi-VN')}đ</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. KHÁM PHÁ BẮC NINH */}
      <section className="section-padding explore-section">
        <div className="home-container">
          <div className="section-header-center">
            <h2 className="section-title">KHÁM PHÁ BẮC NINH</h2>
            <p className="section-subtitle">Vùng đất của những di sản</p>
          </div>
          <div className="explore-grid">
            {exploreItems.map((item, idx) => (
              <div className="explore-card hover-lift" key={idx} onClick={() => navigate(`/explore`, { state: { item } })} style={{ cursor: 'pointer' }}>
                <img src={item.img} alt={item.title} loading="lazy" />
                <div className="explore-overlay"></div>
                <div className="explore-content">
                  <span className="explore-icon">{item.icon}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. VIDEO TRẢI NGHIỆM */}
      <section className="video-section">
        <div className="video-overlay-content">
           <h2>MỘT VÒNG KINH BẮC</h2>
           <p>Khám phá vùng đất của di sản, văn hóa và con người.</p>
           <button className="btn-play-video" aria-label="Xem video Một vòng Kinh Bắc" onClick={() => setShowVideo(true)}><Play size={32}/></button>
           <span className="video-hint">XEM VIDEO</span>
        </div>
        <img src="/tour41.jpg" alt="Khung cảnh văn hóa Kinh Bắc" className="video-bg-placeholder" loading="lazy" />
      </section>

      {/* 8. ĐIỂM ĐẾN NỔI BẬT */}
      <section className="section-padding top-destinations bg-light">
        <div className="home-container">
          <div className="section-header-center">
            <h2 className="section-title">ĐIỂM ĐẾN NỔI BẬT</h2>
          </div>
          <div className="destination-tags">
             {[
               { name: 'Chùa Dâu', province: 'Bắc Ninh', img: '/tour1.jpg' },
               { name: 'Đền Đô', province: 'Bắc Ninh', img: '/tour2.jpg' },
               { name: 'Đông Hồ', province: 'Bắc Ninh', img: '/tranhdh.jpg' },
               { name: 'Tây Yên Tử', province: 'Bắc Giang', img: '/tyt.webp' },
               { name: 'Vĩnh Nghiêm', province: 'Bắc Giang', img: '/chuavn.jpg' },
               { name: 'Đồng Cao', province: 'Bắc Giang', img: '/dongcao.jpg' }
             ].map(dest => (
               <Link to={`/tours?destination=${dest.name}`} className="dest-tag-card" key={dest.name}>
                 <img src={dest.img} alt={dest.name} className="dest-tag-bg" loading="lazy" />
                 <div className="dest-tag-overlay"></div>
                 <span>{dest.name}</span>
                 <small>{dest.province}</small>
               </Link>
             ))}
          </div>
        </div>
      </section>

      {/* 9. QUY TRÌNH ĐẶT TOUR */}
      <section className="section-padding booking-process-section">
        <div className="home-container">
          <div className="section-header-center">
            <h2 className="section-title">Quy trình đặt tour</h2>
            <p className="section-subtitle">Đơn giản, nhanh chóng, an toàn</p>
          </div>

          <div className="process-timeline">
             <div className="process-step">
                <div className="step-icon-wrap"><Map size={28}/></div>
                <div className="step-number">01</div>
                <h4>Chọn tour</h4>
             </div>

             <div className="process-line"></div>

             <div className="process-step">
                <div className="step-icon-wrap"><CalendarDays size={28}/></div>
                <div className="step-number">02</div>
                <h4>Chọn ngày</h4>
             </div>

             <div className="process-line"></div>

             <div className="process-step">
                <div className="step-icon-wrap"><FileText size={28}/></div>
                <div className="step-number">03</div>
                <h4>Nhập thông tin</h4>
             </div>

             <div className="process-line"></div>

             <div className="process-step">
                <div className="step-icon-wrap"><CreditCard size={28}/></div>
                <div className="step-number">04</div>
                <h4>Thanh toán</h4>
             </div>

             <div className="process-line"></div>

             <div className="process-step">
                <div className="step-icon-wrap"><Ticket size={28}/></div>
                <div className="step-number">05</div>
                <h4>Nhận vé</h4>
             </div>
          </div>
        </div>
      </section>

      {/* 10. CTA ĐẶT TOUR */}
      <section className="cta-section section-padding">
         <div className="home-container" style={{textAlign: 'center'}}>
            <h2>Sẵn sàng cho chuyến đi của bạn?</h2>
            <p>Khám phá các di sản văn hóa và bắt đầu hành trình tuyệt vời ngay hôm nay.</p>
            <Link to="/tours" className="btn-hero-primary" style={{marginTop: '20px', display: 'inline-block'}}>ĐẶT TOUR NGAY</Link>
         </div>
      </section>

      {/* Video modal */}
      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" aria-label="Đóng video" onClick={() => setShowVideo(false)}>
              <X size={24} />
            </button>
            <video src="/vd.mp4" controls autoPlay playsInline ref={el => { if(el) el.play().catch(e => console.log('Autoplay blocked:', e)) }} />
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
