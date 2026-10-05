import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, ShieldCheck, Mail, Smartphone, MoreHorizontal } from 'lucide-react';
import './AdminDashboard.css';

const AdminPermissions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', role: 'staff' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = () => {
    apiFetch(`${API_BASE}/api/auth/users`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải danh sách người dùng:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `${API_BASE}/api/auth/users/${currentUserId}`
        : `${API_BASE}/api/auth/register`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        // Email rỗng -> gửi null để backend không ghi đè '' lên email đang có
        body: JSON.stringify({ ...formData, email: formData.email.trim() || null }),
        credentials: 'include'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Lỗi thao tác');
      
      setShowModal(false);
      setFormData({ username: '', email: '', phone: '', password: '', role: 'staff' });
      setIsEditing(false);
      setCurrentUserId(null);
      fetchUsers();
      
      if (isEditing) {
        alert('Cập nhật tài khoản thành công!');
      } else {
        alert('Tạo tài khoản thành công! Hệ thống đã gửi email xác nhận.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setFormData({
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include'
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi cập nhật quyền');
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi xóa tài khoản');
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return { bg: '#e0e7ff', color: '#4f46e5', label: 'Quản trị viên', icon: '👑' };
      case 'ketoan': return { bg: '#dbeafe', color: '#2563eb', label: 'Kế toán', icon: '💰' };
      case 'staff': 
      default: return { bg: '#f1f5f9', color: '#475569', label: 'Nhân viên', icon: '👔' };
    }
  };

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Tài khoản & Phân quyền Hệ thống</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Quản lý danh sách tài khoản nhân viên, quản lý và cấp quyền truy cập hệ thống.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setCurrentUserId(null);
            setFormData({ username: '', email: '', phone: '', password: '', role: 'staff' });
            setShowModal(true);
          }}
          style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
        >
          <Plus size={18}/> Tạo tài khoản mới
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ background: 'white', padding: '15px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo họ tên, email hoặc vai trò..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 45px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px', background: '#f8fafc' }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Tổng cộng: <strong style={{ color: '#0f172a' }}>{filteredUsers.length} tài khoản</strong>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', fontWeight: '700', fontSize: '12px' }}>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>STT</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Họ tên người dùng</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Email liên hệ</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Số điện thoại</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'center' }}>Vai trò & Phân quyền</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy tài khoản nào</td></tr>
            ) : filteredUsers.map((user, index) => {
              const roleStyle = getRoleStyle(user.role);
              const initial = user.username.charAt(0).toUpperCase();
              
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontWeight: '500' }}>{index + 1}</td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        {initial}
                      </div>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>{user.username}</span>
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    {user.email || 'Chưa cập nhật'}
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    {user.phone || 'Chưa cập nhật'}
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        border: 'none', 
                        background: roleStyle.bg, 
                        color: roleStyle.color, 
                        fontWeight: '600', 
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        textAlign: 'center',
                        fontSize: '13px'
                      }}
                    >
                      <option value="admin">👑 Quản trị viên</option>
                      <option value="staff">👔 Nhân viên</option>
                      <option value="ketoan">💰 Kế toán</option>
                    </select>
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {user.is_verified || user.role === 'admin' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #bae6fd' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0369a1' }}></span> Đang hoạt động
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fffbeb', color: '#d97706', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #fde68a' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span> Chờ xác nhận
                      </span>
                    )}
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => openEditModal(user)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Sửa thông tin">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Xóa tài khoản">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo Mới */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '450px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>
              {isEditing ? 'Sửa thông tin tài khoản' : 'Thêm tài khoản hệ thống'}
            </h3>
            
            <form onSubmit={handleCreateOrUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Họ tên người dùng *</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Email liên hệ *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  placeholder="0912345678"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Mật khẩu {isEditing ? '(Bỏ trống nếu không đổi)' : '*'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  placeholder="********"
                  required={!isEditing}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Vai trò & Phân quyền</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', background: 'white' }} 
                >
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="ketoan">Kế toán (Accountant)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  {isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissions;
