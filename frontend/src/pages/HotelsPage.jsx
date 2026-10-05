import React, { useEffect } from 'react';
import { Building, MapPin, Star, Coffee, Wifi, Car, Utensils, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 

const HotelsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mockHotels = [
    {
      id: 1,
      name: "Mường Thanh Luxury Bắc Ninh",
      image: "/muongthanhbn.jpg",
      location: "Phường Kinh Bắc - Thành phố Bắc Ninh",
      rating: 5,
      price: "1,200,000",
      description: "Tọa lạc tại trung tâm thành phố Bắc Ninh, Mường Thanh Luxury mang đến không gian nghỉ dưỡng 5 sao sang trọng, kết hợp hoàn hảo giữa nét hiện đại và bản sắc văn hóa Kinh Bắc.",
      amenities: ["Wifi miễn phí", "Hồ bơi ngoài trời", "Spa & Massage", "Nhà hàng Á - Âu", "Bãi đậu xe rộng rãi"],
    },
    {
      id: 2,
      name: "Grand Phoenix Hotel Bắc Ninh",
      image: "/grand.jpg",
      location: "Phường Kinh Bắc - Thành phố Bắc Ninh",
      rating: 5,
      price: "1,450,000",
      description: "Khách sạn biểu tượng với kiến trúc tinh tế, phòng ốc rộng rãi, tầm nhìn tuyệt đẹp bao quát toàn thành phố cùng dịch vụ chuẩn quốc tế 24/7.",
      amenities: ["Wifi tốc độ cao", "Phòng Gym cao cấp", "Sky Bar", "Bữa sáng Buffet", "Phòng hội nghị"],
    },
    {
      id: 3,
      name: "Mường Thanh Grand Bắc Giang",
      image: "/mtbg.jpg",
      location: "Phường Bắc Giang - Thành phố Bắc Ninh",
      rating: 4,
      price: "950,000",
      description: "Lựa chọn hàng đầu tại Bắc Giang với thiết kế trang nhã, ấm cúng. Nằm ngay quảng trường trung tâm, rất thuận tiện cho việc di chuyển và tham quan.",
      amenities: ["Wifi miễn phí", "Hồ bơi", "Phòng Gym", "Nhà hàng", "Dịch vụ phòng"],
    },
    {
      id: 4,
      name: "Vinpearl Hotel Bắc Ninh",
      image: "/vinpearl.jpg",
      location: "Phường Kinh Bắc - Thành phố Bắc Ninh",
      rating: 5,
      price: "1,500,000",
      description: "Trải nghiệm nghỉ dưỡng đẳng cấp 5 sao với tầm nhìn toàn cảnh thành phố nhộn nhịp, mang đến sự sang trọng và tiện nghi tuyệt đối.",
      amenities: ["Wifi miễn phí", "Hồ bơi 4 mùa", "Lounge cao cấp", "Nhà hàng 5 sao", "Dịch vụ xe đưa đón"],
    }
  ];

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" }}>
      {/* Banner */}
      <div style={{
        height: '50vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image with Parallax effect */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/muongthanhbn.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
          transform: 'scale(1.05)',
          zIndex: 1
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px' }}>
          <span style={{ 
            display: 'inline-block', 
            padding: '8px 20px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(10px)', 
            borderRadius: '30px',
            marginBottom: '20px',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>Lưu trú đẳng cấp</span>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '20px', textShadow: '0 4px 15px rgba(0,0,0,0.3)', color: 'white' }}>Khách sạn Tốt nhất</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8', opacity: 0.9 }}>
            Trải nghiệm dịch vụ nghỉ dưỡng hoàn hảo tại các khách sạn hàng đầu khu vực Kinh Bắc và các tỉnh lân cận.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '-50px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '40px' }}>
          {mockHotels.map((hotel, index) => (
            <div key={hotel.id} style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.06)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
            className="hotel-card"
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-12px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Image Section */}
              <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                <img src={hotel.image} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hotel-img" />
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'white',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  fontWeight: '800',
                  color: 'var(--primary-dark)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>
                  Từ {hotel.price}đ <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}>/đêm</span>
                </div>
                
                {/* Overlay text on image */}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: 'white' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)', color: 'white' }}>{hotel.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={16} />
                    <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>{hotel.location}</span>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '20px' }}>
                  {[...Array(hotel.rating)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                </div>
                
                <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '25px', fontSize: '1.05rem', flex: 1 }}>
                  {hotel.description}
                </p>
                
                {/* Amenities Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px', 
                  marginBottom: '30px',
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px'
                }}>
                  {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.9rem',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '500'
                    }}>
                      <CheckCircle2 size={16} color="var(--primary-color)" />
                      {amenity}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Tính năng đặt phòng tại ${hotel.name} đang được hoàn thiện. Vui lòng quay lại sau!`);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(2, 132, 199, 0.3)';
                  }}
                >
                  Xem chi tiết & Đặt phòng
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS cho hover image */}
      <style>{`
        .hotel-card:hover .hotel-img {
          transform: scale(1.08) !important;
        }
      `}</style>
    </div>
  );
};

export default HotelsPage;
