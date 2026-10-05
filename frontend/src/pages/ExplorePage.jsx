import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Music, BookOpen, Utensils, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../config';
import './HomePage.css'; // Reusing styles from HomePage for the explore grid

const ExplorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;
  
  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(!item);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!item) {
      fetch(`${API_BASE}/api/explore`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setExploreItems(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi tải explore items:", err);
          setLoading(false);
        });
    }
  }, [item]);

  if (!item) {
    if (loading) {
      return (
        <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h2>Đang tải thông tin...</h2>
        </div>
      );
    }
    
    // Nếu không có item cụ thể, hiển thị danh sách
    return (
      <div style={{ padding: '80px 20px', minHeight: '60vh', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', textAlign: 'center', marginBottom: '40px' }}>Khám phá Bắc Ninh</h2>
        {exploreItems.length > 0 ? (
          <div className="explore-grid">
            {exploreItems.map((exItem, idx) => (
              <div className="explore-card hover-lift" key={idx} onClick={() => navigate(`/explore`, { state: { item: exItem } })} style={{ cursor: 'pointer' }}>
                <img src={exItem.img} alt={exItem.title} loading="lazy" />
                <div className="explore-overlay"></div>
                <div className="explore-content">
                  <span className="explore-icon">{exItem.icon}</span>
                  <h4>{exItem.title}</h4>
                  <p>{exItem.description || exItem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2>Không tìm thấy chủ đề</h2>
            <button onClick={() => navigate('/')} style={{ padding: '10px 20px', marginTop: '20px', background: 'var(--primary-main)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Quay lại trang chủ</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', width: '100%', height: '60vh', overflow: 'hidden' }}>
        {item.has_video || item.hasVideo ? (
          <video src={item.video_url || item.videoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
        ) : (
          <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', zIndex: 10 }}>
          <span style={{ fontSize: '4rem', marginBottom: '10px' }}>{item.icon}</span>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '15px', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>{item.title}</h1>
          <p style={{ fontSize: '1.5rem', fontWeight: '500', maxWidth: '800px', padding: '0 20px' }}>{item.description || item.desc}</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '-40px auto 0 auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position: 'relative', zIndex: 20 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--primary-main)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginBottom: '30px' }}>
          <ArrowLeft size={20} /> Quay lại
        </button>

        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-dark)', marginBottom: '20px' }}>Chi tiết về {item.title}</h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '40px', whiteSpace: 'pre-line' }}>{item.detail}</p>

        {/* Gallery Section */}
        {item.images && item.images.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-main)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '10px', marginBottom: '30px' }}>Bộ sưu tập</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {item.images.map((imgUrl, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', height: '250px' }}>
                  <img src={imgUrl} alt={`${item.title} ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
