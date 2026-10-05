import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Home, Map, Compass, Coffee, Building, Search, Ticket, Menu, X } from 'lucide-react';
import { getLocalUser } from '../api';
import './ClientLayout.css';

const ClientLayout = () => {
  const customerUser = getLocalUser('customerUser');
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  // Đóng menu mobile khi chuyển trang
  const closeMenu = () => setMenuOpen(false);

  // SEO: tiêu đề theo trang
  useEffect(() => {
    const path = location.pathname;
    let title = 'Vuo Travel | Đặt Tour Du Lịch Kinh Bắc';
    if (path === '/tours') title = 'Danh sách Tour | Vuo Travel';
    else if (path.startsWith('/tours/')) title = 'Chi tiết Tour | Vuo Travel';
    else if (path.startsWith('/booking')) title = 'Đặt Tour | Vuo Travel';
    else if (path === '/tra-cuu') title = 'Tra cứu đơn hàng | Vuo Travel';
    else if (path === '/login') title = 'Đăng nhập | Vuo Travel';
    else if (path === '/register') title = 'Đăng ký | Vuo Travel';
    else if (path === '/profile') title = 'Tài khoản của tôi | Vuo Travel';
    else if (path === '/destinations') title = 'Điểm đến nổi bật | Vuo Travel';
    else if (path === '/hotels') title = 'Khách sạn & Lưu trú | Vuo Travel';
    else if (path.startsWith('/explore')) title = 'Khám phá Kinh Bắc | Vuo Travel';
    document.title = title;
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'TRANG CHỦ', icon: <Home size={18} /> },
    { to: '/destinations', label: 'ĐIỂM ĐẾN', icon: <Map size={18} /> },
    { to: '/tours', label: 'TOUR', icon: <Compass size={18} /> },
    { to: '/explore', label: 'KHÁM PHÁ', icon: <Coffee size={18} /> },
    { to: '/hotels', label: 'KHÁCH SẠN', icon: <Building size={18} /> },
    { to: '/tra-cuu', label: 'TRA CỨU ĐƠN', icon: <Ticket size={18} /> },
  ];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="client-layout">
      {/* Skip link cho keyboard/screen reader */}
      <a href="#main-content" className="skip-link">Bỏ qua nội dung</a>

      {/* Main Header */}
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="logo-title">
            <span className="logo-mark" aria-hidden="true">V</span>
            <span><span className="logo-accent">Vuo</span>Travel</span>
          </Link>

          <div className="auth-links">
            {customerUser ? (
              <Link to="/profile" className="btn-auth-outline"><User size={16}/> {customerUser.full_name}</Link>
            ) : (
              <>
                <Link to="/login" className="btn-auth-outline">Đăng nhập</Link>
                <Link to="/register" className="btn-auth-primary">Đăng ký</Link>
              </>
            )}
          </div>

          <button
            className="nav-toggle"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Banner chỉ hiển thị ở trang chủ — các trang trong dùng header + nav gọn */}
      {isHome && (
        <div className="top-banner">
          <img src="/qh.jpg" alt="Ảnh nền bìa Kinh Bắc" />
        </div>
      )}

      {/* Navigation Bar */}
      <nav className={`sketch-nav ${isHome ? 'nav-overlay' : 'nav-standalone'} ${menuOpen ? 'nav-open' : ''}`}>
        <div className="nav-links">
          {navItems.map((item, idx) => (
            <React.Fragment key={item.to}>
              {idx > 0 && <div className="nav-divider"></div>}
              <Link to={item.to} className={`nav-item ${isActive(item.to) ? 'active' : ''}`} onClick={closeMenu}>
                {item.icon} {item.label}
              </Link>
            </React.Fragment>
          ))}
          {/* Auth links chỉ hiện trong menu mobile */}
          {!customerUser && (
            <>
              <div className="nav-divider nav-auth-mobile"></div>
              <Link to="/login" className="nav-item nav-auth-mobile" onClick={closeMenu}><User size={18}/> ĐĂNG NHẬP</Link>
              <Link to="/register" className="nav-item nav-auth-mobile" onClick={closeMenu}><User size={18}/> ĐĂNG KÝ</Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={`layout-body ${!isHome ? 'full-width' : ''}`}>
        <main className="layout-content" id="main-content">
          <Outlet />
        </main>

        {/* Sidebar - Only on HomePage */}
        {isHome && (
          <aside className="layout-sidebar">
            <div className="sidebar-widget search-widget glass-card">
              <h3><Search size={18}/> Tìm kiếm Tour</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  aria-label="Tìm kiếm tour"
                  className="sidebar-input"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/tours?search=${encodeURIComponent(sidebarSearch)}`);
                  }}
                />
              </div>
              <button
                className="btn-search-sidebar"
                onClick={() => navigate(`/tours?search=${encodeURIComponent(sidebarSearch)}`)}
              >
                Tìm kiếm ngay
              </button>
            </div>

            <div className="sidebar-widget glass-card">
              <h3><Ticket size={18}/> Tra cứu đơn hàng</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                Đã đặt tour? Kiểm tra trạng thái đơn bằng Mã đơn và Số điện thoại.
              </p>
              <Link to="/tra-cuu" className="btn-search-sidebar" style={{ display: 'block', textAlign: 'center' }}>
                Tra cứu ngay
              </Link>
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3 className="footer-logo">
              <span className="logo-mark logo-mark-sm" aria-hidden="true">V</span>
              <span><span className="logo-accent">Vuo</span> Travel</span>
            </h3>
            <p>Khám phá thế giới cùng chúng tôi.</p>
          </div>
          <div className="footer-col">
            <h4>Khám phá</h4>
            <ul>
               <li><Link to="/tours">Danh sách Tour</Link></li>
               <li><Link to="/explore">Văn hóa Kinh Bắc</Link></li>
               <li><Link to="/destinations">Điểm đến nổi bật</Link></li>
               <li><Link to="/tra-cuu">Tra cứu đơn hàng</Link></li>
               <li><Link to="/gioi-thieu">Giới thiệu</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul>
               <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
               <li><Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link></li>
               <li><Link to="/lien-he">Liên hệ</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Vuo Travel. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
