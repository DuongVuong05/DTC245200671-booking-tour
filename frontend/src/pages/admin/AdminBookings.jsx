import { API_BASE } from '../../config';
import { apiFetch, getLocalUser } from '../../api';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckSquare, XCircle, RefreshCw, Search } from 'lucide-react';

const AdminBookings = () => {
  const adminUser = getLocalUser('adminUser');
  const canManageBookings = !adminUser || ['admin', 'staff'].includes(adminUser.role);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch(`${API_BASE}/api/bookings`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải dữ liệu (HTTP ' + res.status + ')');
        return res.json();
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi kết nối API bookings:', err);
        setBookings([]);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/bookings/${id}/status`, { credentials: 'include', 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại.');
      
      fetchBookings();
    } catch (err) {
      alert('Thông báo: ' + err.message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.full_name || '').toLowerCase().includes(q) ||
      (b.phone || '').includes(q) ||
      (b.tour_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem', fontWeight: 700 }}>
          Quản lý Lịch hẹn & Đặt Tour
        </h2>
        <button 
          onClick={fetchBookings}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            background: '#f8fafc', 
            color: '#475569', 
            border: '1px solid #e2e8f0', 
            fontWeight: '600', 
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Search box */}
      <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: '380px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Tìm theo tên khách, SĐT hoặc tên tour..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '8px 14px 8px 38px', border: '1px solid #cbd5e1', borderRadius: '20px', outline: 'none', fontSize: '0.85rem', background: '#ffffff', color: '#334155' }}
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: `Tất cả (${bookings.length})`, key: 'ALL' },
          { label: `Chờ xác nhận (${bookings.filter(b => b.status === 'Pending').length})`, key: 'Pending' },
          { label: `Đã xác nhận (${bookings.filter(b => b.status === 'Confirmed').length})`, key: 'Confirmed' },
          { label: `Đã hủy (${bookings.filter(b => b.status === 'Cancelled').length})`, key: 'Cancelled' },
        ].map((btn) => (
          <button 
            key={btn.key}
            onClick={() => setFilterStatus(btn.key)} 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              background: filterStatus === btn.key ? '#0ea5e9' : '#ffffff', 
              color: filterStatus === btn.key ? '#ffffff' : '#64748b', 
              border: filterStatus === btn.key ? 'none' : '1px solid #cbd5e1', 
              fontWeight: '500', 
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc' }}>
              <th style={{ padding: '12px 14px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em', borderRadius: '8px 0 0 8px' }}>Mã Đơn</th>
              <th style={{ padding: '12px 14px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Khách Hàng</th>
              <th style={{ padding: '12px 14px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Tour & Ngày</th>
              <th style={{ padding: '12px 14px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Tổng Tiền</th>
              <th style={{ padding: '12px 14px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Trạng Thái</th>
              <th style={{ padding: '12px 14px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#ef4444', fontSize: '0.9rem' }}>
                  {error}. Vui lòng thử lại.
                </td>
              </tr>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0ea5e9', fontSize: '0.85rem' }}>KB-{b.id}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem', marginBottom: '4px' }}>{b.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.phone} • {b.num_people} Khách</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.85rem', marginBottom: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.tour_name}>{b.tour_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Đi: {new Date(b.departure_date).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '600', color: '#ef4444', fontSize: '0.9rem' }}>
                    {Number(b.total_price).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: b.status === 'Confirmed' ? '#f0fdf4' : b.status === 'Cancelled' ? '#fef2f2' : '#fefce8',
                      color: b.status === 'Confirmed' ? '#16a34a' : b.status === 'Cancelled' ? '#ef4444' : '#d97706',
                      border: `1px solid ${b.status === 'Confirmed' ? '#bbf7d0' : b.status === 'Cancelled' ? '#fecaca' : '#fef08a'}`,
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      <span style={{ 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        background: b.status === 'Confirmed' ? '#16a34a' : b.status === 'Cancelled' ? '#ef4444' : '#d97706' 
                      }}></span>
                      {b.status === 'Confirmed' ? 'Đã xác nhận' : b.status === 'Cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
                    </span>
                  </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {canManageBookings && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {b.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                              style={{
                                background: '#fdf2f8',
                                color: '#e11d48',
                                border: '1px solid #fce7f3',
                                padding: '4px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#fce7f3'}
                              onMouseOut={e => e.currentTarget.style.background = '#fdf2f8'}
                            >
                              <CheckSquare size={14}/> Xác nhận
                            </button>
                          )}
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                              style={{
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                padding: '4px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                              onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                            >
                              <XCircle size={14}/> Hủy
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Không có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
