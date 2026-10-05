import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Users, ShieldCheck, Compass } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1>Vuo Travel — Về miền di sản</h1>
          <p>Đồng hành cùng bạn khám phá vùng đất Kinh Bắc: Bắc Ninh, Bắc Giang — nơi hội tụ di sản văn hóa, lịch sử và thiên nhiên.</p>
        </div>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>Câu chuyện của chúng tôi</h2>
          <p>
            Vuo Travel ra đời với một niềm tin giản dị: mỗi vùng đất đều có những câu chuyện đáng kể,
            và Kinh Bắc là nơi những câu chuyện ấy sống động nhất. Từ những làn điệu quan họ mượt mà bên sông Cầu,
            những ngôi chùa cổ kính nghìn năm tuổi, đến thảo nguyên Đồng Cao hùng vĩ —
            chúng tôi xây dựng những hành trình giúp du khách chạm vào văn hóa, chứ không chỉ đi ngang qua nó.
          </p>
          <p>
            Mỗi tour của Vuo Travel đều được thiết kế kỹ lưỡng bởi đội ngũ am hiểu địa phương,
            kết hợp trải nghiệm văn hóa — lịch sử — tâm linh — thiên nhiên, phù hợp cả khách đi gia đình,
            đoàn thể hay du lịch một mình.
          </p>
        </section>

        <section className="about-section">
          <h2>Điều bạn sẽ nhận được</h2>
          <div className="about-values">
            <div className="about-value-card">
              <Compass size={30} className="about-value-icon" />
              <h3>Hành trình được tuyển chọn</h3>
              <p>Mỗi tuyến tour đều được khảo sát thực tế, lịch trình rõ ràng từng ngày, điểm đến có giá trị văn hóa đích thực.</p>
            </div>
            <div className="about-value-card">
              <Users size={30} className="about-value-icon" />
              <h3>HDV tâm huyết</h3>
              <p>Hướng dẫn viên am hiểu lịch sử, văn hóa địa phương — kể chuyện Kinh Bắc bằng cả trái tim.</p>
            </div>
            <div className="about-value-card">
              <ShieldCheck size={30} className="about-value-icon" />
              <h3>Minh bạch & an toàn</h3>
              <p>Giá công khai, chính sách rõ ràng, thanh toán đơn giản. Mọi đơn đặt tour đều được xác nhận và giữ chỗ.</p>
            </div>
            <div className="about-value-card">
              <Map size={30} className="about-value-icon" />
              <h3>Đúng chất Kinh Bắc</h3>
              <p>Không phải tour "đại trà" — mỗi hành trình đều mang dấu ấn riêng của vùng đất Kinh Bắc.</p>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <h2>Bắt đầu hành trình của bạn</h2>
          <p>Khám phá các tour du lịch Kinh Bắc đang mở bán.</p>
          <Link to="/tours" className="btn-hero-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
            XEM CÁC TOUR
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
