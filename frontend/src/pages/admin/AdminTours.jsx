import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, MapPin, Clock, Edit2, Calendar } from 'lucide-react';
import AdminSchedules from './AdminSchedules';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeTour, setActiveTour] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: 'Bắc Ninh',
    price: '',
    duration: '1 Ngày',
    image_url: '',
    included: '',
    excluded: '',
    policy: '',
    gallery: '',
    is_featured: false,
    old_price: '',
    discount: '',
    rating: '',
    rating_count: '',
    schedule_note: '',
    vehicle: '',
    hotel: ''
  });

  useEffect(() => {
    let ignore = false;
    apiFetch(`${API_BASE}/api/tours`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (ignore) return;
        if (Array.isArray(data)) setTours(data);
        setLoading(false);
      })
      .catch(err => {
        if (ignore) return;
        console.error('Lỗi tải tours:', err);
        setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const loadTours = () => {
    apiFetch(`${API_BASE}/api/tours`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTours(data);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Vui lòng nhập Tên tour và Giá tour.');
      return;
    }
    try {
      const isEdit = !!editingTour;
      const url = isEdit ? `${API_BASE}/api/tours/${editingTour.id}` : `${API_BASE}/api/tours`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, { credentials: 'include', 
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image_url: formData.image_url || 'https://images.unsplash.com/photo-1596404987702-861c8535048d?auto=format&fit=crop&q=80&w=500'
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Lưu tour thất bại');
      
      setShowModal(false);
      loadTours();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingTour(null);
    setFormData({
      name: '',
      description: '',
      destination: 'Bắc Ninh',
      price: '',
      duration: '1 Ngày',
      image_url: '',
      included: '',
      excluded: '',
      policy: '',
      gallery: '',
      is_featured: false,
      old_price: '',
      discount: '',
      rating: '',
      rating_count: '',
      schedule_note: '',
      vehicle: '',
      hotel: ''
    });
    setShowModal(true);
  };

  const openEditModal = (tour) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name,
      description: tour.description || '',
      destination: tour.destination || 'Bắc Ninh',
      price: tour.price,
      duration: tour.duration || '1 Ngày',
      image_url: tour.image_url || '',
      included: tour.included || '',
      excluded: tour.excluded || '',
      policy: tour.policy || '',
      gallery: tour.gallery || '',
      is_featured: !!tour.is_featured,
      old_price: tour.old_price != null ? tour.old_price : '',
      discount: tour.discount || '',
      rating: tour.rating != null ? tour.rating : '',
      rating_count: tour.rating_count != null ? tour.rating_count : '',
      schedule_note: tour.schedule_note || '',
      vehicle: tour.vehicle || '',
      hotel: tour.hotel || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/tours/${id}`, { credentials: 'include', 
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Xóa tour thất bại');
      loadTours();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{background: '#e0f2fe', padding: '10px', borderRadius: '12px', color: '#0ea5e9', display: 'flex'}}>
              <MapPin size={28}/>
            </div>
            Dịch vụ & Tour Du Lịch
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Quản lý danh sách các tour du lịch, điểm đến và giá cả.</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
        >
          <Plus size={18}/> Thêm Tour Mới
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '30px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}/>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc tên tour, điểm đến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '14px 16px 14px 46px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#ffffff', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          />
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>
      ) : tours.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>Chưa có tour nào</div>
      ) : tours.filter((tour) => {
          const q = searchTerm.trim().toLowerCase();
          if (!q) return true;
          return (
            (tour.name || '').toLowerCase().includes(q) ||
            (tour.destination || '').toLowerCase().includes(q) ||
            `KB-${String(tour.id).padStart(3, '0')}`.includes(q)
          );
        }).length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>Không tìm thấy tour phù hợp với "{searchTerm}"</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {tours.filter((tour) => {
            const q = searchTerm.trim().toLowerCase();
            if (!q) return true;
            return (
              (tour.name || '').toLowerCase().includes(q) ||
              (tour.destination || '').toLowerCase().includes(q) ||
              `KB-${String(tour.id).padStart(3, '0')}`.includes(q)
            );
          }).map(tour => {
            const displayImage = tour.image_url || 'https://images.unsplash.com/photo-1596404987702-861c8535048d?auto=format&fit=crop&q=80&w=500';
            return (
              <div key={tour.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' }, display: 'flex', flexDirection: 'column' }}>
                
                {/* Image Header */}
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={displayImage} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: '#059669', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                    Đang mở bán
                  </div>
                  
                  {/* Tour ID Overlay */}
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '30px 15px 10px 15px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '700' }}>Mã: KB-{tour.id.toString().padStart(3, '0')}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '17px', fontWeight: 800, lineHeight: '1.4' }}>{tour.name}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                      <Clock size={16} color="#0ea5e9"/> <strong>Thời lượng:</strong> {tour.duration}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                      <MapPin size={16} color="#0ea5e9"/> <strong>Điểm đến:</strong> {tour.destination || 'Nhiều điểm'}
                    </div>
                  </div>
                  
                  {/* Price & Actions */}
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <div style={{ color: '#e11d48', fontSize: '18px', fontWeight: '800' }}>
                      {Number(tour.price).toLocaleString('vi-VN')} đ
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setActiveTour(tour);
                          setShowScheduleModal(true);
                        }}
                        style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s', ':hover': { background: '#d1fae5' } }}
                        title="Quản lý Lịch trình"
                      >
                        <Calendar size={16} /> Lịch trình
                      </button>
                      <button 
                        onClick={() => openEditModal(tour)}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', cursor: 'pointer', transition: 'all 0.2s', ':hover': { background: '#e0f2fe' } }}
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(tour.id)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', ':hover': { background: '#fee2e2' } }}
                        title="Xóa tour"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal is kept unchanged for now, but UI updated */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '640px', maxWidth: '94%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{editingTour ? 'Sửa Thông Tin Tour' : 'Thêm Tour Du Lịch Mới'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Tên Tour *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Mô tả ngắn</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', height: '80px', fontFamily: 'inherit' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>URL Ảnh Bìa (Link hình ảnh)</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Ví dụ: https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Bao gồm (mỗi dòng 1 mục)</label>
                <textarea
                  value={formData.included}
                  onChange={e => setFormData({ ...formData, included: e.target.value })}
                  placeholder={'Xe đưa đón\nHDV tiếng Việt\nVé tham quan'}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', height: '80px', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Không bao gồm (mỗi dòng 1 mục)</label>
                <textarea
                  value={formData.excluded}
                  onChange={e => setFormData({ ...formData, excluded: e.target.value })}
                  placeholder={'Chi phí cá nhân\nĐồ uống'}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', height: '80px', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Chính sách & Điều khoản (mỗi dòng 1 mục)</label>
                <textarea
                  value={formData.policy}
                  onChange={e => setFormData({ ...formData, policy: e.target.value })}
                  placeholder={'Hủy miễn phí trước 24h\nTrẻ em dưới 5 tuổi miễn phí...'}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', height: '80px', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Gallery ảnh (URL phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.gallery}
                  onChange={e => setFormData({ ...formData, gallery: e.target.value })}
                  placeholder="https://..., https://..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#334155', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Tour nổi bật (hiển thị ở trang chủ)
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.old_price}
                    onChange={e => setFormData({ ...formData, old_price: e.target.value })}
                    placeholder="850000"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>% giảm giá (hiển thị)</label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="-23%"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Rating (1-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="5"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Số đánh giá</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rating_count}
                    onChange={e => setFormData({ ...formData, rating_count: e.target.value })}
                    placeholder="12"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Lịch khởi hành (hiển thị)</label>
                  <input
                    type="text"
                    value={formData.schedule_note}
                    onChange={e => setFormData({ ...formData, schedule_note: e.target.value })}
                    placeholder="Thứ 7 - CN Hàng Tuần"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Phương tiện</label>
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    placeholder="Xe du lịch đời mới"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Khách sạn</label>
                  <input
                    type="text"
                    value={formData.hotel}
                    onChange={e => setFormData({ ...formData, hotel: e.target.value })}
                    placeholder="Không áp dụng"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Giá (VNĐ) *</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Thời lượng</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: '600' }}>Hủy Bỏ</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary-gradient)', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}>
                  {editingTour ? 'Lưu Thay Đổi' : 'Tạo Tour Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Manager Modal Overlay */}
      {showScheduleModal && activeTour && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: '1200px', height: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>Quản lý Lịch trình</h3>
                <p style={{ margin: '5px 0 0 0', color: '#0ea5e9', fontWeight: '600', fontSize: '14px' }}>Tour: {activeTour.name}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', color: '#475569', display: 'flex' }}><X size={20}/></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <AdminSchedules preselectedTourId={activeTour.id} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTours;
