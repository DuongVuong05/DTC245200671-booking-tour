import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import './AdminDashboard.css';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '16 chỗ',
    license_plate: '',
    seat_capacity: 16,
    status: 'Active'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVehicles = useCallback(() => {
    setLoading(true);
    apiFetch(`${API_BASE}/api/vehicles`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi fetch phương tiện:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const capacity = parseInt(type.replace(/[^0-9]/g, '')) || 16;
    setFormData({ ...formData, type, seat_capacity: capacity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingVehicle;
    const url = isEdit 
      ? `${API_BASE}/api/vehicles/${editingVehicle.id}`
      : `${API_BASE}/api/vehicles`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Lỗi khi lưu phương tiện');
        return;
      }

      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      console.error('Lỗi lưu phương tiện:', err);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phương tiện này?')) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/vehicles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchVehicles();
      } else {
        alert('Lỗi xóa phương tiện');
      }
    } catch (err) {
      console.error('Lỗi xóa phương tiện:', err);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({ name: '', type: '16 chỗ', license_plate: '', seat_capacity: 16, status: 'Active' });
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      license_plate: vehicle.license_plate,
      seat_capacity: vehicle.seat_capacity,
      status: vehicle.status
    });
    setShowModal(true);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-content-inner" style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{background: '#e0f2fe', padding: '8px', borderRadius: '10px', color: '#0ea5e9', display: 'flex'}}>
              <Bus size={24}/>
            </div>
            Quản lý Phương tiện
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Danh sách xe và tình trạng hoạt động trên hệ thống</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)' }}
        >
          <Plus size={18}/> Thêm xe mới
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ background: 'white', padding: '15px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên xe hoặc biển số..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 45px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '14px', background: '#f8fafc' }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Tổng cộng: <strong style={{ color: '#0f172a' }}>{filteredVehicles.length} phương tiện</strong>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', fontWeight: '700', fontSize: '12px' }}>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Tên Xe</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Sức chứa</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase' }}>Biển số</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ padding: '16px 20px', textTransform: 'uppercase', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredVehicles.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Chưa có phương tiện nào</td></tr>
            ) : filteredVehicles.map((vehicle) => {
              
              return (
                <tr key={vehicle.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontWeight: '500' }}>#{vehicle.id}</td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{vehicle.name}</span>
                  </td>
                  
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {vehicle.type}
                      </span>
                      <span>({vehicle.seat_capacity} chỗ)</span>
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                        fontFamily: 'monospace', 
                        background: '#f1f5f9', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: '1px dashed #cbd5e1',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        color: '#334155'
                    }}>
                      {vehicle.license_plate}
                    </span>
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {vehicle.status === 'Active' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #a7f3d0' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span> Hoạt động
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fffbeb', color: '#d97706', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #fde68a' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span> Bảo trì
                      </span>
                    )}
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => openEditModal(vehicle)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Sửa thông tin">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(vehicle.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Xóa phương tiện">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
                {editingVehicle ? 'Cập nhật Phương tiện' : 'Thêm Phương tiện mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Tên xe (VD: Thaco Mobihome)</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                  placeholder="Nhập tên xe..."
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Loại xe</label>
                  <select 
                    name="type"
                    value={formData.type} 
                    onChange={handleTypeChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', background: 'white' }} 
                    required
                  >
                    <option value="4 chỗ">4 chỗ</option>
                    <option value="7 chỗ">7 chỗ</option>
                    <option value="16 chỗ">16 chỗ</option>
                    <option value="29 chỗ">29 chỗ</option>
                    <option value="45 chỗ">45 chỗ</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Sức chứa (Thực tế)</label>
                  <input 
                    type="number" 
                    name="seat_capacity"
                    value={formData.seat_capacity} 
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Biển số xe</label>
                <input 
                  type="text" 
                  name="license_plate"
                  value={formData.license_plate} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }} 
                  placeholder="VD: 30F-123.45"
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Trạng thái</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', background: 'white' }} 
                >
                  <option value="Active">Đang hoạt động</option>
                  <option value="Maintenance">Đang bảo trì</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  {editingVehicle ? 'Lưu thay đổi' : 'Thêm phương tiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
