import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, Home, Map } from 'lucide-react';

const ComingSoonPage = ({ title = 'Tính năng' }) => {
  return (
    <div style={{minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center'}}>
      <Construction size={64} color="#2563EB" style={{marginBottom: '1.5rem'}} />
      <h2 style={{fontSize: '2rem', color: '#1e293b', margin: '0 0 0.75rem 0'}}>
        {title} đang được phát triển
      </h2>
      <p style={{color: '#64748b', fontSize: '1.05rem', maxWidth: '480px', lineHeight: '1.7', marginBottom: '2rem'}}>
        Chúng tôi đang hoàn thiện tính năng này để mang đến trải nghiệm tốt nhất. Mời bạn khám phá các tour hiện có của Vuo Travel.
      </p>
      <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
        <Link to="/tours" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', backgroundColor: '#2563EB', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>
          <Map size={18}/> Xem Tours
        </Link>
        <Link to="/" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', textDecoration: 'none', fontWeight: 'bold'}}>
          <Home size={18}/> Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};

export default ComingSoonPage;
