import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Calendar,
  Users,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './AdminDashboard.css';

// Bảng màu donut — gán lần lượt theo thứ tự tour
const PIE_COLORS = ['#059669', '#0284c7', '#d97706', '#7c3aed', '#dc2626'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_tours: 0,
    total_bookings: 0,
    total_revenue: 0,
    total_customers: 0
  });
  // Doanh thu 7 ngày — THẬT từ /api/reports/dashboard (truy vấn bảng bookings)
  const [chartData, setChartData] = useState([]);
  // Toàn bộ bookings — dùng cho "booking gần đây" và thống kê donut
  const [allBookings, setAllBookings] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setLoadError('');

    Promise.all([
      apiFetch(`${API_BASE}/api/bookings/stats`, { credentials: 'include' }).then(res => res.json()).catch(() => null),
      apiFetch(`${API_BASE}/api/reports/dashboard`, { credentials: 'include' }).then(res => res.json()).catch(() => null),
      apiFetch(`${API_BASE}/api/bookings`, { credentials: 'include' }).then(res => res.json()).catch(() => null),
      apiFetch(`${API_BASE}/api/schedules`, { credentials: 'include' }).then(res => res.json()).catch(() => null)
    ])
      .then(([statsData, reportData, bookingsData, schedulesData]) => {
        if (statsData && !statsData.error) {
          setStats({
            total_tours: statsData.total_tours ?? 0,
            total_bookings: statsData.total_bookings ?? 0,
            total_revenue: statsData.total_revenue ?? 0,
            total_customers: statsData.total_customers ?? 0
          });
        }
        if (reportData && Array.isArray(reportData.chartData)) {
          setChartData(reportData.chartData);
        }
        setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);

        // Lịch khởi hành sắp tới (chưa qua ngày), gần nhất trước — dữ liệu thật từ DB
        if (Array.isArray(schedulesData)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = schedulesData
            .filter(s => {
              const dep = new Date(s.departure_date);
              return !isNaN(dep.getTime()) && dep >= today;
            })
            .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date))
            .slice(0, 4);
          setUpcomingSchedules(upcoming);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi API dashboard:', err);
        setLoadError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentBookings = useMemo(() => allBookings.slice(0, 3), [allBookings]);

  // Donut: tỷ lệ booking theo tour — tính THẬT từ danh sách booking lấy từ API (không hardcode)
  const pieData = useMemo(() => {
    const countByTour = {};
    allBookings.forEach(b => {
      const name = b.tour_name || 'Tour khác';
      countByTour[name] = (countByTour[name] || 0) + 1;
    });
    const total = allBookings.length || 1;
    return Object.entries(countByTour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], idx) => ({
        name: name.length > 28 ? name.slice(0, 28) + '…' : name,
        value: Math.round((count / total) * 100),
        color: PIE_COLORS[idx % PIE_COLORS.length]
      }));
  }, [allBookings]);

  return (
    <div className="dashboard-container">
      {/* Title */}
      <h2 className="dashboard-title">Tổng quan Hệ thống Booking Tour</h2>

      {loadError && (
        <div role="alert" style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ {loadError}
          <button onClick={loadDashboard} style={{ marginLeft: '12px', background: 'none', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}>
            Thử lại
          </button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="stat-cards-grid">
        {/* Card 1: Revenue */}
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-title">Doanh thu (đơn đã xác nhận)</div>
              <div className="stat-value" style={{ color: '#047857' }}>
                {Number(stats.total_revenue).toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="stat-icon-wrapper stat-icon-emerald">
              <CreditCard size={22} />
            </div>
          </div>
          <div className="stat-badge-bottom">
            <TrendingUp size={14} />
            <span>Cập nhật theo CSDL</span>
          </div>
        </div>

        {/* Card 2: Total Bookings */}
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-title">Tổng số booking</div>
              <div className="stat-value">{stats.total_bookings}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-blue">
              <Calendar size={22} />
            </div>
          </div>
          <div className="stat-badge-bottom">
            <TrendingUp size={14} />
            <span>Theo thời gian thực</span>
          </div>
        </div>

        {/* Card 3: Customers */}
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-title">Khách hàng</div>
              <div className="stat-value">{stats.total_customers}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-green">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-badge-bottom">
            <TrendingUp size={14} />
            <span>Hệ thống CRM</span>
          </div>
        </div>

        {/* Card 4: Tours */}
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-title">Tour du lịch</div>
              <div className="stat-value">{stats.total_tours}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-purple">
              <Sparkles size={22} />
            </div>
          </div>
          <div className="stat-badge-bottom">
            <TrendingUp size={14} />
            <span>Gói dịch vụ</span>
          </div>
        </div>
      </div>

      {/* Middle Row Charts */}
      <div className="dashboard-middle-row">
        {/* Column 1: Bar Chart — Doanh thu 7 ngày THẬT từ DB */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h3 className="card-title">Doanh thu 7 ngày gần đây (Triệu VNĐ)</h3>
          </div>
          <div style={{ width: '100%', height: 210 }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '80px' }}>Đang tải dữ liệu...</p>
            ) : chartData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '80px' }}>
                Chưa có booking xác nhận trong 7 ngày qua.
              </p>
            ) : (
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} unit="tr" />
                  <Tooltip
                    cursor={{ fill: 'rgba(5, 150, 105, 0.05)' }}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Column 2: Donut Chart — tỷ lệ booking theo tour, tính thật từ API */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h3 className="card-title">Top tour được đặt nhiều</h3>
          </div>
          <div className="donut-chart-container">
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>Đang tải...</p>
            ) : pieData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>
                Chưa có dữ liệu booking.
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                <div style={{ flexShrink: 0, width: 150, height: 150 }}>
                  <PieChart width={150} height={150}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="donut-legend-list" style={{ flex: 1, margin: 0, minWidth: 0 }}>
                  {pieData.map((item, index) => (
                    <div className="legend-item" key={index}>
                      <div className="legend-dot-label">
                        <span className="legend-dot" style={{ background: item.color }}></span>
                        <span>{item.name}</span>
                      </div>
                      <span className="legend-pct">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Promo Quote Card */}
        <div className="promo-quote-card">
          <div className="promo-quote-text">
            "Du lịch Kinh Bắc - Hành trình khám phá di sản văn hóa & thiên nhiên"
          </div>
          <div className="promo-image-wrapper">
            <img
              src="/dcc.jpg"
              alt="Du lịch Kinh Bắc"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Widget 1: Recent Bookings List */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h3 className="card-title">Booking gần đây</h3>
            <a href="/admin/bookings" className="card-action-link">Xem tất cả</a>
          </div>

          <div className="booking-list-items">
            {recentBookings.length === 0 ? (
              <div className="booking-item-row" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                Không có booking gần đây
              </div>
            ) : (
              recentBookings.map((item, index) => (
                <div className="booking-item-row" key={item.id ?? index}>
                  <div className="booking-item-left">
                    <span className="booking-time-tag">
                      {item.booking_date ? new Date(item.booking_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <div className="booking-customer-info">
                      <span className="customer-name">{item.full_name}</span>
                      <span className="tour-name-sub">{item.tour_name}</span>
                    </div>
                  </div>

                  <div>
                    {item.status === 'Completed' ? (
                      <span className="pill-badge badge-completed">Hoàn thành</span>
                    ) : item.status === 'Confirmed' ? (
                      <span className="pill-badge badge-confirmed">Đã xác nhận</span>
                    ) : item.status === 'Cancelled' ? (
                      <span className="pill-badge badge-pending">Đã hủy</span>
                    ) : (
                      <span className="pill-badge badge-pending">Chờ xác nhận</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Lịch khởi hành sắp tới — dữ liệu THẬT từ /api/schedules */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h3 className="card-title">Lịch khởi hành sắp tới</h3>
            <a href="/admin/schedules" className="card-action-link">Xem chi tiết</a>
          </div>

          <div className="status-tour-items">
            {loading ? (
              <div className="status-tour-row" style={{ justifyContent: 'center' }}>Đang tải dữ liệu...</div>
            ) : upcomingSchedules.length === 0 ? (
              <div className="status-tour-row" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                Chưa có lịch khởi hành sắp tới
              </div>
            ) : (
              upcomingSchedules.map((s) => {
                const seats = Number(s.available_seats) || 0;
                return (
                  <div className="status-tour-row" key={s.id}>
                    <div className="tour-title-bullet">
                      <span className="color-dot-square" style={{ background: seats > 0 ? '#059669' : '#dc2626' }}></span>
                      <span>{s.tour_name}</span>
                    </div>
                    <span className={`pill-badge ${seats > 0 ? 'badge-available' : 'badge-full'}`}>
                      {seats > 0
                        ? `• ${new Date(s.departure_date).toLocaleDateString('vi-VN')} — Còn ${seats} chỗ`
                        : '• Đã đủ đoàn'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
