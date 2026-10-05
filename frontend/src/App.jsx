import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientLayout from './pages/ClientLayout';
import HomePage from './pages/HomePage';
import TourListPage from './pages/TourListPage';
import TourDetailPage from './pages/TourDetailPage';
import BookingPage from './pages/BookingPage';
import BookingResultPage from './pages/BookingResultPage';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerProfile from './pages/CustomerProfile';
import ComingSoonPage from './pages/ComingSoonPage';
import NotFoundPage from './pages/NotFoundPage';
import DestinationsPage from './pages/DestinationsPage';
import ExplorePage from './pages/ExplorePage';
import HotelsPage from './pages/HotelsPage';
import LookupPage from './pages/LookupPage';
import AboutPage from './pages/AboutPage';

// Admin tách thành chunk riêng (React.lazy) — recharts/dashboard không vào bundle của khách hàng
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTours = lazy(() => import('./pages/admin/AdminTours'));
const AdminSchedules = lazy(() => import('./pages/admin/AdminSchedules'));
const AdminGuides = lazy(() => import('./pages/admin/AdminGuides'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminVehicles = lazy(() => import('./pages/admin/AdminVehicles'));
const AdminPromotions = lazy(() => import('./pages/admin/AdminPromotions'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminPermissions = lazy(() => import('./pages/admin/AdminPermissions'));
const AdminExplore = lazy(() => import('./pages/admin/AdminExplore'));

const AdminSuspense = ({ children }) => (
  <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Đang tải...</div>}>
    {children}
  </Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tours" element={<TourListPage />} />
            <Route path="tours/:id" element={<TourDetailPage />} />
            <Route path="booking/:id" element={<BookingPage />} />
            <Route path="booking-success" element={<BookingResultPage />} />
            <Route path="profile" element={<CustomerProfile />} />

            {/* Các trang chưa triển khai — tránh trang trắng khi bấm link */}
            <Route path="destinations" element={<DestinationsPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="explore/:category" element={<ExplorePage />} />
            <Route path="flights" element={<ComingSoonPage title="Chuyến bay" />} />
            <Route path="blog" element={<ComingSoonPage title="Bài viết" />} />

            {/* Tra cứu đơn hàng + các trang hỗ trợ */}
            <Route path="gioi-thieu" element={<AboutPage />} />
            <Route path="tra-cuu" element={<LookupPage />} />
            <Route path="faq" element={<ComingSoonPage title="Câu hỏi thường gặp" />} />
            <Route path="chinh-sach-bao-mat" element={<ComingSoonPage title="Chính sách bảo mật" />} />
            <Route path="lien-he" element={<ComingSoonPage title="Liên hệ" />} />
          </Route>

          {/* Auth routes đứng riêng (không nằm trong ClientLayout) — hiển thị 2 cột ngang full màn hình */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />

          {/* Admin Routes (lazy-loaded) */}
          <Route path="/admin/login" element={<AdminSuspense><AdminLogin /></AdminSuspense>} />
          <Route path="/admin" element={<AdminSuspense><AdminLayout /></AdminSuspense>}>
            <Route index element={<AdminSuspense><AdminDashboard /></AdminSuspense>} />
            <Route path="explore" element={<AdminSuspense><AdminExplore /></AdminSuspense>} />
            <Route path="tours" element={<AdminSuspense><AdminTours /></AdminSuspense>} />
            <Route path="schedules" element={<AdminSuspense><AdminSchedules /></AdminSuspense>} />
            <Route path="guides" element={<AdminSuspense><AdminGuides /></AdminSuspense>} />
            <Route path="vehicles" element={<AdminSuspense><AdminVehicles /></AdminSuspense>} />
            <Route path="promotions" element={<AdminSuspense><AdminPromotions /></AdminSuspense>} />
            <Route path="bookings" element={<AdminSuspense><AdminBookings /></AdminSuspense>} />
            <Route path="customers" element={<AdminSuspense><AdminCustomers /></AdminSuspense>} />
            <Route path="reports" element={<AdminSuspense><AdminReports /></AdminSuspense>} />
            <Route path="permissions" element={<AdminSuspense><AdminPermissions /></AdminSuspense>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
