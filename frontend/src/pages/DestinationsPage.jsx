import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DestinationsPage = () => {
  const destinations = [
    { id: 1, name: 'Bắc Ninh', desc: 'Vùng đất của những làn điệu Dân ca Quan họ mượt mà, đằm thắm và những ngôi chùa cổ kính.', img: '/qh.jpg' },
    { id: 2, name: 'Bắc Giang', desc: 'Sức sống mãnh liệt của thiên nhiên đại ngàn và dấu ấn lịch sử hào hùng.', img: '/dongcao.jpg' },
    { id: 3, name: 'Tây Yên Tử', desc: 'Chốn linh thiêng cõi Phật, nơi giao thoa giữa đất trời và thiên nhiên hùng vĩ.', img: '/tyt.webp' },
    { id: 4, name: 'Làng Diềm', desc: 'Cái nôi của dân ca Quan họ, tĩnh lặng mộc mạc lưu giữ ngàn năm văn hiến.', img: '/tour25.jpg' },
    { id: 5, name: 'Chùa Vĩnh Nghiêm', desc: 'Trung tâm Phật giáo Trúc Lâm Yên Tử lớn nhất Bắc Giang, nơi lưu giữ Mộc bản di sản.', img: '/chuavn.jpg' },
    { id: 6, name: 'Thành Xương Giang', desc: 'Di tích lịch sử cấp quốc gia đặc biệt ghi dấu chiến công hiển sách.', img: '/xg.jpg' },
    { id: 7, name: 'Khu di tích Yên Thế', desc: 'Nơi tưởng niệm vị anh hùng áo vải Hoàng Hoa Thám và nghĩa quân Yên Thế.', img: '/hht.jpg' },
    { id: 8, name: 'Cây Dã Hương Ngàn Năm', desc: 'Báu vật thiên nhiên cổ thụ nghìn năm tuổi tại Lạng Giang, Bắc Giang.', img: '/dh.jpg' }
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.8rem', color: '#0f172a', marginBottom: '15px' }}>Điểm Đến Nổi Bật</h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá những vùng đất mang đậm bản sắc văn hóa và vẻ đẹp thiên nhiên Kinh Bắc.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {destinations.map(dest => (
          <div key={dest.id} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backgroundColor: '#fff', transition: 'transform 0.3s ease' }} className="hover-lift">
            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
              <img src={dest.img} alt={dest.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} /> HOT
              </div>
            </div>
            <div style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '10px' }}>{dest.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>{dest.desc}</p>
              <Link to={`/tours?destination=${dest.name}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                Xem tour đến đây <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsPage;
