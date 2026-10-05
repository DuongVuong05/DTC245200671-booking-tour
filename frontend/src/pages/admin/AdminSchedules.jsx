import { API_BASE, resolveImageUrl } from '../../config';
import { apiFetch, formatDateInput } from '../../api';
import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Car, Plus, Trash2, X } from 'lucide-react';

const AdminSchedules = ({ preselectedTourId }) => {
  const [schedules, setSchedules] = useState([]);
  const [tours, setTours] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    tour_id: preselectedTourId || '',
    vehicle_id: '',
    departure_date: '',
    return_date: '',
    available_seats: 25,
    guide_name: 'Nguyễn Văn Minh',
    image_url: ''
  });

  const loadSchedules = () => {
    const schedulesUrl = preselectedTourId 
      ? `${API_BASE}/api/schedules/tour/${preselectedTourId}`
      : `${API_BASE}/api/schedules`;
      
    Promise.all([
      apiFetch(schedulesUrl, { credentials: 'include' }).then(res => res.json()),
      apiFetch(`${API_BASE}/api/tours`, { credentials: 'include' }).then(res => res.json()),
      apiFetch(`${API_BASE}/api/vehicles`, { credentials: 'include' }).then(res => res.json())
    ])
      .then(([schedData, tourData, vehicleData]) => {
        if (Array.isArray(schedData)) setSchedules(schedData);
        if (Array.isArray(tourData)) setTours(tourData);
        if (Array.isArray(vehicleData)) setVehicles(vehicleData);
      })
      .catch(() => {});
  };

  useEffect(() => {
    let ignore = false;
    const schedulesUrl = preselectedTourId 
      ? `${API_BASE}/api/schedules/tour/${preselectedTourId}`
      : `${API_BASE}/api/schedules`;

    Promise.all([
      apiFetch(schedulesUrl, { credentials: 'include' }).then(res => res.json()),
      apiFetch(`${API_BASE}/api/tours`, { credentials: 'include' }).then(res => res.json()),
      apiFetch(`${API_BASE}/api/vehicles`, { credentials: 'include' }).then(res => res.json())
    ])
      .then(([schedData, tourData, vehicleData]) => {
        if (ignore) return;
        if (Array.isArray(schedData)) setSchedules(schedData);
        if (Array.isArray(tourData)) {
          setTours(tourData);
          setFormData(prev => prev.tour_id ? prev : { ...prev, tour_id: tourData[0]?.id });
        }
        if (Array.isArray(vehicleData)) {
          setVehicles(vehicleData);
        }
        setLoading(false);
      })
      .catch(err => {
        if (ignore) return;
        console.error('Lỗi tải dữ liệu schedules/tours:', err);
        setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      tour_id: preselectedTourId || tours[0]?.id || '',
      vehicle_id: '',
      departure_date: '',
      return_date: '',
      available_seats: 25,
      guide_name: '',
      image_url: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (schedule) => {
    setIsEditMode(true);
    setFormData({
      id: schedule.id,
      tour_id: schedule.tour_id,
      vehicle_id: schedule.vehicle_id || '',
      departure_date: schedule.departure_date,
      return_date: schedule.return_date,
      available_seats: schedule.available_seats,
      guide_name: schedule.guide_name,
      // /api/schedules/tour/:tourId trả về cột image_url, /api/schedules trả về alias schedule_image
      image_url: schedule.image_url || schedule.schedule_image || ''
    });
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.tour_id || !formData.departure_date || !formData.return_date) {
      alert('Vui lòng chọn Tour và điền đầy đủ Ngày đi, Ngày về.');
      return;
    }
    try {
      const url = isEditMode ? `${API_BASE}/api/schedules/${formData.id}` : `${API_BASE}/api/schedules`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, { credentials: 'include', 
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || (isEditMode ? 'Cập nhật lịch trình thất bại' : 'Tạo lịch trình thất bại'));
      setShowModal(false);
      loadSchedules();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch trình khởi hành này?')) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/schedules/${id}`, { credentials: 'include', 
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Xóa lịch trình thất bại');
      loadSchedules();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100%', padding: preselectedTourId ? '10px' : '30px' }}>
      
      {/* Header */}
      {!preselectedTourId && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{background: '#e0f2fe', padding: '10px', borderRadius: '12px', color: '#0ea5e9', display: 'flex'}}>
                <Calendar size={28}/>
              </div>
              Phòng / Lịch Trình Khởi Hành
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Quản lý phòng vé, phân công xe, hướng dẫn viên và số chỗ khả dụng.</p>
          </div>
          <button 
            onClick={openCreateModal}
            style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
          >
            <Plus size={18}/> Thêm Lịch Trình Mới
          </button>
        </div>
      )}

      {preselectedTourId && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            onClick={openCreateModal}
            style={{ background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
          >
            <Plus size={16}/> Tạo thêm ngày khởi hành
          </button>
        </div>
      )}
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>
      ) : schedules.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>Chưa có lịch trình nào</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {schedules.map(schedule => {
            // Random image based on tour id as fallback
            const randomImageId = ((schedule.tour_id || preselectedTourId || 1) % 10) + 10;
            const fallbackImageUrl = `https://picsum.photos/id/${randomImageId}/400/200`;
            const imageUrl = resolveImageUrl(schedule.schedule_image || schedule.image_url || schedule.tour_image || fallbackImageUrl);
            
            // Note: when fetching by tourId, the backend route might not join with `tours` to get tour_name. 
            // We'll fall back gracefully or assume the tour name is known.
            const tourName = schedule.tour_name || (tours.find(t => t.id === schedule.tour_id)?.name) || 'Chuyến đi';

            return (
              <div key={schedule.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f1f5f9', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' }, display: 'flex', flexDirection: 'column' }}>
                
                {/* Card Image Header */}
                <div style={{ position: 'relative', height: '160px' }}>
                  <img src={imageUrl} alt="Tour Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: '#0ea5e9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {new Date(schedule.departure_date).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 15px 10px 15px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600' }}>Mã lịch trình: KB-SCH-{schedule.id}</span>
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {!preselectedTourId && <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '16px', fontWeight: 800, lineHeight: '1.4' }}>{tourName}</h3>}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginTop: preselectedTourId ? '0' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px' }}><UserCheck size={16} color={schedule.guide_name === 'Chưa phân công' ? '#ef4444' : '#0284c7'}/></div>
                      <span style={{ color: '#475569' }}><strong>HDV:</strong> <span style={{ color: schedule.guide_name === 'Chưa phân công' ? '#ef4444' : '#0f172a' }}>{schedule.guide_name}</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px' }}><Car size={16} color="#ea580c"/></div>
                      <span style={{ color: '#475569' }}><strong>Xe:</strong> <span style={{ color: '#0f172a' }}>{schedule.vehicle_name ? `${schedule.vehicle_name} (${schedule.license_plate})` : 'Đang điều phối'}</span></span>
                    </div>
                    
                    {/* Status progress bar for seats */}
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: '600', color: '#64748b' }}>
                        <span>Chỗ trống: {schedule.available_seats}</span>
                        <span style={{ color: schedule.available_seats < 5 ? '#ef4444' : '#059669' }}>{schedule.available_seats < 5 ? 'Sắp kín' : 'Đang mở bán'}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(10, Math.min(100, 100 - (schedule.available_seats * 3)))}%`, height: '100%', background: schedule.available_seats < 5 ? '#ef4444' : '#0ea5e9', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>
                  
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <button 
                      onClick={() => handleEditClick(schedule)}
                      style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s', ':hover': { background: '#f1f5f9' } }}
                    >
                      Thông tin chi tiết
                    </button>
                    <button 
                      onClick={() => handleDelete(schedule.id)}
                      style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      title="Xóa lịch trình"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{isEditMode ? 'Thông Tin Chi Tiết Lịch Trình' : 'Thêm Lịch Trình Khởi Hành Mới'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Chọn Tour *</label>
                <select 
                  value={formData.tour_id} 
                  onChange={e => setFormData({ ...formData, tour_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  required
                >
                  {tours.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({Number(t.price).toLocaleString('vi-VN')} đ)</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Ảnh Lịch Trình (Tùy chọn)</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  
                  {formData.image_url ? (
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <img src={resolveImageUrl(formData.image_url)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #0ea5e9' }} />
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Calendar size={24} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)', ':hover': { transform: 'translateY(-2px)' } }}>
                      {uploading ? 'Đang tải...' : 'Tải Ảnh Lên'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploading(true);

                          const formDataUpload = new FormData();
                          formDataUpload.append('image', file);
                          try {
                            const res = await apiFetch(`${API_BASE}/api/upload`, {
                              method: 'POST',
                              credentials: 'include',
                              body: formDataUpload
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setFormData(prev => ({ ...prev, image_url: data.url }));
                            } else {
                              alert('Lỗi: ' + (data.error || 'Tải ảnh thất bại'));
                            }
                          } catch (err) {
                            alert('Lỗi tải ảnh: ' + err.message);
                          } finally {
                            setUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>Định dạng JPG, PNG, GIF, WEBP. Tối đa 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Chọn Xe (Tùy chọn)</label>
                <select 
                  value={formData.vehicle_id || ''} 
                  onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                >
                  <option value="">-- Chưa điều phối xe --</option>
                  {vehicles.filter(v => v.status === 'Active').map(v => (
                    <option key={v.id} value={v.id}>{v.name} - {v.type} ({v.license_plate})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Ngày Khởi Hành *</label>
                  <input
                    type="date"
                    value={formatDateInput(formData.departure_date)}
                    onChange={e => setFormData({ ...formData, departure_date: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Ngày Trở Về *</label>
                  <input
                    type="date"
                    value={formatDateInput(formData.return_date)}
                    onChange={e => setFormData({ ...formData, return_date: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Số Chỗ Khả Dụng *</label>
                  <input 
                    type="number" 
                    value={formData.available_seats} 
                    onChange={e => setFormData({ ...formData, available_seats: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>Hướng Dẫn Viên</label>
                  <input 
                    type="text" 
                    value={formData.guide_name} 
                    onChange={e => setFormData({ ...formData, guide_name: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: '600' }}>Hủy Bỏ</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary-gradient)', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}>
                  {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Lịch Trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
