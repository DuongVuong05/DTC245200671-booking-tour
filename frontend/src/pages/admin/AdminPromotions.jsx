import { API_BASE } from '../../config';
import { apiFetch, formatDateInput } from '../../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Plus, Search, Edit2, Trash2, X, Tag } from 'lucide-react';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_booking_value: 0,
    start_date: '',
    end_date: '',
    usage_limit: '',
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPromotions = useCallback(() => {
    setLoading(true);
    apiFetch(`${API_BASE}/api/promotions`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPromotions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi fetch promotions:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingPromo;
    const url = isEdit 
      ? `${API_BASE}/api/promotions/${editingPromo.id}`
      : `${API_BASE}/api/promotions`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          usage_limit: formData.usage_limit || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Lỗi khi lưu mã giảm giá');
        return;
      }

      setShowModal(false);
      fetchPromotions();
    } catch (err) {
      console.error('Lỗi lưu mã giảm giá:', err);
      alert('Đã có lỗi xảy ra.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã này?')) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/promotions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchPromotions();
      } else {
        alert('Lỗi xóa mã giảm giá');
      }
    } catch (err) {
      console.error('Lỗi xóa mã giảm giá:', err);
    }
  };

  const openAddModal = () => {
    setEditingPromo(null);
    setFormData({ code: '', discount_type: 'percent', discount_value: '', min_booking_value: 0, start_date: '', end_date: '', usage_limit: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      min_booking_value: promo.min_booking_value,
      start_date: formatDateInput(promo.start_date),
      end_date: formatDateInput(promo.end_date),
      usage_limit: promo.usage_limit || '',
      is_active: promo.is_active
    });
    setShowModal(true);
  };

  const filteredPromos = promotions.filter(p => p.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{background: '#e0f2fe', padding: '8px', borderRadius: '10px', color: '#0ea5e9', display: 'flex'}}>
              <Gift size={24}/>
            </div>
            Quản Lý Chương Trình Khuyến Mãi & Voucher
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Danh sách voucher giảm giá và chương trình ưu đãi dành cho khách hàng Vuo Travel.</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
        >
          <Plus size={18}/> Tạo mã khuyến mãi mới
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ background: 'white', padding: '15px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Tìm theo mã voucher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 45px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px', background: '#f8fafc' }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Tổng số: <strong style={{ color: '#0ea5e9' }}>{filteredPromos.length} mã ưu đãi</strong>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', fontWeight: '700', fontSize: '12px' }}>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Mã Voucher</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Mức Giảm Giá</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Đơn Tối Thiểu</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Thời Hạn Áp Dụng</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'center' }}>Đã Dùng / Giới Hạn</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'center' }}>Trạng Thái</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredPromos.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Chưa có mã khuyến mãi nào</td></tr>
            ) : filteredPromos.map((promo) => {
              
              return (
                <tr key={promo.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', fontWeight: '700' }}>
                      <Tag size={16}/> {promo.code}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: '#059669' }}>
                    {promo.discount_type === 'percent' 
                      ? `Giảm ${promo.discount_value}%` 
                      : `Giảm ${Number(promo.discount_value).toLocaleString('vi-VN')} đ`}
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: '#475569', fontWeight: '600' }}>
                    {Number(promo.min_booking_value).toLocaleString('vi-VN')} đ
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                    {promo.start_date ? formatDateInput(promo.start_date) : 'Không giới hạn'}
                    {' ➔ '}
                    {promo.end_date ? formatDateInput(promo.end_date) : 'Không giới hạn'}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>
                    {promo.used_count} / {promo.usage_limit || '∞'}
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {promo.is_active ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #a7f3d0' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span> Đang chạy
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', color: '#64748b', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #cbd5e1' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }}></span> Đã tắt
                      </span>
                    )}
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => openEditModal(promo)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(promo.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Xóa">
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
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
                {editingPromo ? 'Cập nhật Mã Giảm Giá' : 'Thêm Mã Khuyến Mãi Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Mã Voucher (Code) *</label>
                <input 
                  type="text" 
                  name="code"
                  value={formData.code} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }} 
                  placeholder="VD: SUMMER2026"
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Loại giảm giá</label>
                  <select 
                    name="discount_type"
                    value={formData.discount_type} 
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', background: 'white' }} 
                    required
                  >
                    <option value="percent">% Phần trăm</option>
                    <option value="fixed">VND Cố định</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Mức giảm *</label>
                  <input 
                    type="number" 
                    name="discount_value"
                    value={formData.discount_value} 
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Giá trị đơn hàng tối thiểu (đ)</label>
                <input 
                  type="number" 
                  name="min_booking_value"
                  value={formData.min_booking_value} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Từ ngày</label>
                  <input 
                    type="date" 
                    name="start_date"
                    value={formData.start_date} 
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Đến ngày</label>
                  <input 
                    type="date" 
                    name="end_date"
                    value={formData.end_date} 
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Giới hạn số lần dùng (Bỏ trống = Không giới hạn)</label>
                <input 
                  type="number" 
                  name="usage_limit"
                  value={formData.usage_limit} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  name="is_active" 
                  checked={formData.is_active} 
                  onChange={handleInputChange} 
                  id="is_active" 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="is_active" style={{ margin: 0, fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>Kích hoạt mã này</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  {editingPromo ? 'Lưu thay đổi' : 'Thêm khuyến mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
