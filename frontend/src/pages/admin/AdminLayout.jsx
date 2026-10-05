import { API_BASE } from '../../config';
import { getLocalUser } from '../../api';
import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Map, 
  UserCheck, 
  MapPin, 
  Bus, 
  BarChart3, 
  Tag, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  Search, 
  Bell, 
  ChevronDown,
  Globe,
  Trees,
  Compass
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const adminUser = getLocalUser('adminUser');

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const allMenuItems = [
    { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard, exact: true, roles: ['admin', 'staff', 'ketoan'] },
    { label: 'Khám phá Bắc Ninh', path: '/admin/explore', icon: Compass, roles: ['admin', 'staff'] },
    { label: 'Booking / Đặt tour', path: '/admin/bookings', icon: CalendarDays, roles: ['admin', 'staff', 'ketoan'] },
    { label: 'Khách hàng', path: '/admin/customers', icon: Users, roles: ['admin', 'staff'] },
    { label: 'Tour du lịch', path: '/admin/tours', icon: Map, roles: ['admin', 'staff'] },
    { label: 'Hướng dẫn viên', path: '/admin/guides', icon: UserCheck, roles: ['admin', 'staff'] },
    { label: 'Phương tiện', path: '/admin/vehicles', icon: Bus, roles: ['admin', 'staff'] },
    { label: 'Báo cáo - Thống kê', path: '/admin/reports', icon: BarChart3, roles: ['admin', 'staff', 'ketoan'] },
    { label: 'Khuyến mãi', path: '/admin/promotions', icon: Tag, roles: ['admin', 'staff'] },
    { label: 'Tài khoản & Phân quyền', path: '/admin/permissions', icon: ShieldCheck, roles: ['admin'] },
  ];

  // Ẩn menu không thuộc quyền của role hiện tại (vd ketoan chỉ thấy Tổng quan, Lịch hẹn, Báo cáo)
  const menuItems = allMenuItems.filter((item) => item.roles.includes(adminUser?.role));

  const isLinkActive = (item) => {
    if (item.exact) return currentPath === item.path;
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
  };

  return (
    <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand-header">
          <div className="brand-icon-wrapper">
            <Trees size={24} className="brand-logo-icon" />
          </div>
          <div className="brand-text">
            <h1 className="brand-name">Vuo Travel</h1>
            <span className="brand-subtitle">ADMIN CONTROL PANEL</span>
          </div>
        </div>

        {/* Website Khách hàng button */}
        <div className="public-link-container">
          <Link to="/" className="public-link-btn" target="_blank" rel="noreferrer">
            <div className="public-btn-left">
              <Globe size={16} />
              <span>Website Khách Hàng</span>
            </div>
            <span className="public-badge">Public</span>
          </Link>
        </div>

        {/* Sidebar Nav items */}
        <nav className="admin-nav-menu">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link 
                key={index} 
                to={item.path} 
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={18} className="nav-item-icon" />
                <span className="nav-item-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="admin-bottom-section">
          <button
            className="admin-logout-btn"
            onClick={async () => {
              try {
                // Xóa httpOnly cookie phía server
                await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
              } catch (err) {
                console.error('Logout error', err);
              }
              localStorage.removeItem('adminUser');
              navigate('/admin/login');
            }}
            style={{background: 'none', border: 'none', width: '100%', cursor: 'pointer'}}
          >
            <LogOut size={18} />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-top-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
            <div className="header-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng, booking, tour..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  // Enter -> tìm trong danh sách lịch hẹn (khách hàng / tên tour / SĐT)
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    navigate(`/admin/bookings?q=${encodeURIComponent(globalSearch.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="header-right">
            <button className="notification-bell-btn" aria-label="Thông báo">
              <Bell size={19} />
            </button>
            
            <div className="header-divider"></div>

            <div className="admin-user-profile">
              <div className="user-avatar-circle">{adminUser.username.charAt(0).toUpperCase()}</div>
              <div className="user-info-text">
                <span className="user-name">{adminUser.username}</span>
                <span className="user-role-badge">👑 {adminUser.role === 'admin' ? 'Quản trị viên' : (adminUser.role === 'ketoan' ? 'Kế toán' : 'Nhân viên')}</span>
              </div>
              <ChevronDown size={15} className="user-chevron" />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
