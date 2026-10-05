import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import React, { useState, useEffect } from 'react';
import { Eye, Search, Phone, Mail, MapPin, Calendar, Users, X, ShieldCheck, Send, ExternalLink } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/customers`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải customers:', err);
        setLoading(false);
      });
  }, []);

  // Function to get initials from full name
  const getInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Thống kê thật từ dữ liệu khách hàng (không phân hạng giả)
  const phoneCount = customers.filter(c => Boolean(c.phone)).length;
  const emailCount = customers.filter(c => Boolean(c.email)).length;
  const addressCount = customers.filter(c => Boolean(c.address)).length;

  // Filter logic
  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || (
      (cust.full_name || '').toLowerCase().includes(q) ||
      (cust.phone || '').includes(q) ||
      (cust.email || '').toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    if (selectedCategory === 'phone') return Boolean(cust.phone);
    if (selectedCategory === 'email') return Boolean(cust.email);
    return true;
  });

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{background: '#fce7f3', padding: '10px', borderRadius: '12px', color: '#ec4899', display: 'flex'}}>
              <Users size={28}/>
            </div>
            Quản Lý Khách Hàng & Hội Viên
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Hệ thống lưu trữ thông tin hội viên, phân hạng khách hàng và quản lý tương tác.</p>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Tổng Khách Hàng</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{customers.length}</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Khách có SĐT</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#8b5cf6' }}>{phoneCount}</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Khách có Email</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#d97706' }}>{emailCount}</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Khách có Địa chỉ</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>{addressCount}</div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        
        {/* Search bar */}
        <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}/>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT hoặc Email khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 46px', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none', background: '#ffffff', fontSize: '14px' }}
          />
        </div>

        {/* Filter categories */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedCategory('all')} 
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: selectedCategory === 'all' ? '#0f172a' : 'white', color: selectedCategory === 'all' ? 'white' : '#475569', borderColor: selectedCategory === 'all' ? '#0f172a' : '#cbd5e1' }}
          >
            Tất cả ({customers.length})
          </button>

          <button
            onClick={() => setSelectedCategory('phone')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: selectedCategory === 'phone' ? '#8b5cf6' : 'white', color: selectedCategory === 'phone' ? 'white' : '#475569', borderColor: selectedCategory === 'phone' ? '#8b5cf6' : '#cbd5e1' }}
          >
            Có SĐT ({phoneCount})
          </button>

          <button
            onClick={() => setSelectedCategory('email')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: selectedCategory === 'email' ? '#d97706' : 'white', color: selectedCategory === 'email' ? 'white' : '#475569', borderColor: selectedCategory === 'email' ? '#d97706' : '#cbd5e1' }}
          >
            Có Email ({emailCount})
          </button>
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu khách hàng...</div>
      ) : customers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>Chưa có khách hàng nào trong hệ thống.</div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>Không tìm thấy kết quả phù hợp với từ khóa "{searchTerm}"</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '22px' }}>
          {filteredCustomers.map(cust => {
            return (
              <div 
                key={cust.id} 
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
                  border: '1px solid #e2e8f0',
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                
                {/* Profile Header */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #ec4899)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', fontWeight: '800', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                    {getInitials(cust.full_name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{cust.full_name}</h3>
                  </div>
                </div>

                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, padding: '14px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={13} color="#ec4899" />
                    </div>
                    <span style={{ fontWeight: '500' }}>{cust.phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={13} color="#ec4899" />
                    </div>
                    <span style={{ wordBreak: 'break-all' }}>{cust.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={13} color="#ec4899" />
                    </div>
                    <span style={{ lineHeight: '1.4' }}>{cust.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                    <Calendar size={13} /> Tham gia: {new Date(cust.created_at).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {cust.phone && (
                      <a 
                        href={`tel:${cust.phone}`}
                        title="Gọi điện"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      style={{ background: '#0f172a', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Eye size={13} /> Chi tiết
                    </button>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Modal Chi tiết khách hàng */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedCustomer(null)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '520px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Banner Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '28px 24px', color: 'white', position: 'relative', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', color: 'white' }}
              >
                <X size={18}/>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', border: '3px solid rgba(255,255,255,0.2)' }}>
                  {getInitials(selectedCustomer.full_name)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{selectedCustomer.full_name}</h3>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '13px' }}>ID Khách hàng: #{selectedCustomer.id}</p>
                </div>
              </div>
            </div>

            {/* Modal Content Details */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>SỐ ĐIỆN THOẠI</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedCustomer.phone || 'Chưa cập nhật'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>EMAIL</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px', wordBreak: 'break-all' }}>{selectedCustomer.email}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>ĐỊA CHỈ LIÊN HỆ</div>
                <div style={{ fontSize: '14px', color: '#334155', marginTop: '2px' }}>{selectedCustomer.address || 'Chưa cập nhật'}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>NGÀY GIA NHẬP HỆ THỐNG</div>
                <div style={{ fontSize: '14px', color: '#334155', marginTop: '2px' }}>{new Date(selectedCustomer.created_at).toLocaleString('vi-VN')}</div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <a 
                  href={`mailto:${selectedCustomer.email}`}
                  style={{ flex: 1, textAlign: 'center', background: '#ec4899', color: 'white', padding: '10px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Send size={15} /> Gửi Email Thường
                </a>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;

