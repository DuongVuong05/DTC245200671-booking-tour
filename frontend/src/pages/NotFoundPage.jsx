import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Map } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center'}}>
      <h2 style={{fontSize: '5rem', color: '#2563EB', margin: 0, fontWeight: 800}}>404</h2>
      <p style={{color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem'}}>
        Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
        <Link to="/" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', backgroundColor: '#2563EB', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>
          <Home size={18}/> Về Trang Chủ
        </Link>
        <Link to="/tours" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', textDecoration: 'none', fontWeight: 'bold'}}>
          <Map size={18}/> Xem Tours
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
