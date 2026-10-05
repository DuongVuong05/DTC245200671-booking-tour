import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, DollarSign, FileText, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const AdminReports = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    bookingsCount: 0,
    customersCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area');

  // Fetching real data from /api/reports/dashboard
  useEffect(() => {
    let ignore = false;
    apiFetch(`${API_BASE}/api/reports/dashboard`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!ignore) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!ignore) {
          console.error('Error fetching reports:', err);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, []);

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      {/* Header section similar to the screenshot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px', color: '#0ea5e9', display: 'flex' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Báo Cáo - Thống Kê Realtime
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Tổng hợp dữ liệu doanh thu, hóa đơn & khách hàng trực tiếp từ CSDL hệ thống Vuo Travel.</p>
          </div>
        </div>

        {/* Khoảng thời gian thực của biểu đồ: 7 ngày gần nhất (do backend trả về) */}
      </div>

      {/* Top Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        
        {/* Doanh thu Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng doanh thu thực tế</span>
            <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '10px', color: '#ef4444' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
            {loading ? '...' : Number(stats.revenue).toLocaleString('vi-VN')} <span style={{ fontSize: '16px', color: '#ef4444' }}>đ</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
            <Activity size={12} /> Tự động cập nhật từ CSDL
          </div>
        </div>

        {/* Booking Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng số booking</span>
            <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '10px', color: '#f59e0b' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {loading ? '...' : stats.bookingsCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Booking</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
            <Calendar size={12} /> Liên kết đơn Đặt Tour
          </div>
        </div>

        {/* Khách hàng Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Khách hàng đăng ký</span>
            <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px', color: '#10b981' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {loading ? '...' : stats.customersCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Khách hàng</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
            <Users size={12} /> Hệ thống dữ liệu chuẩn
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Doanh Thu 7 Ngày Gần Đây (Triệu VNĐ)</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Biểu đồ tổng hợp doanh thu theo chu kỳ thời gian.</p>
          </div>
          <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '8px', padding: '4px', border: '1px solid #e2e8f0' }}>
            <button 
              onClick={() => setChartType('area')}
              style={{ background: chartType === 'area' ? 'white' : 'transparent', border: chartType === 'area' ? '1px solid #cbd5e1' : 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: chartType === 'area' ? '700' : '600', color: chartType === 'area' ? '#ef4444' : '#64748b', fontSize: '13px', boxShadow: chartType === 'area' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Biểu đồ Miền
            </button>
            <button 
              onClick={() => setChartType('bar')}
              style={{ background: chartType === 'bar' ? 'white' : 'transparent', border: chartType === 'bar' ? '1px solid #cbd5e1' : 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: chartType === 'bar' ? '700' : '600', color: chartType === 'bar' ? '#ef4444' : '#64748b', fontSize: '13px', boxShadow: chartType === 'bar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Biểu đồ Cột
            </button>
          </div>
        </div>

        <div style={{ height: '350px', width: '100%', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `${value}tr`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`${value} Triệu`, 'Doanh Thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            ) : (
              <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `${value}tr`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`${value} Triệu`, 'Doanh Thu']}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default AdminReports;
