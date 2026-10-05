import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';
import { apiFetch } from '../../api';
import { UserCheck, Plus, Edit, Trash2, Mail, Phone, Languages, Award, X } from 'lucide-react';
import './AdminGuides.css';

const AdminGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', avatar: '', experience_years: 1, languages: '', bio: '', status: 'Active'
  });

  const loadGuides = () => {
    setLoading(true);
    apiFetch(`/api/guides`)
      .then(res => res.json())
      .then(data => { setGuides(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadGuides(); }, []);

  const openAddModal = () => {
    setEditingGuide(null);
    setFormData({ full_name: '', email: '', phone: '', avatar: '', experience_years: 1, languages: '', bio: '', status: 'Active' });
    setShowModal(true);
  };

  const openEditModal = (guide) => {
    setEditingGuide(guide);
    setFormData({ ...guide });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if(!window.confirm("Bạn có chắc muốn xóa hướng dẫn viên này?")) return;
    apiFetch(`/api/guides/${id}`, { method: 'DELETE' })
      .then(() => loadGuides());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingGuide ? 'PUT' : 'POST';
    const path = editingGuide ? `/api/guides/${editingGuide.id}` : `/api/guides`;

    apiFetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowModal(false);
      loadGuides();
    });
  };

  return (
    <div className="guides-container">
      <div className="guides-header-panel">
        <div className="guides-title-group">
          <h2>Đội Ngũ Hướng Dẫn Viên</h2>
          <p>Quản lý hồ sơ, kinh nghiệm và thông tin liên hệ của HDV</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <Plus size={20} />
          <span>Thêm HDV mới</span>
        </button>
      </div>

      {loading ? (
        <div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}>
          <div className="spinner" style={{width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        </div>
      ) : (
        <div className="guides-grid">
          {guides.map(guide => (
            <div className="guide-card" key={guide.id}>
              <div className="guide-card-header">
                <img src={guide.avatar || 'https://via.placeholder.com/150'} alt={guide.full_name} className="guide-avatar" />
                <div className="guide-basic-info">
                  <h3 className="guide-name">{guide.full_name}</h3>
                  <span className={`status-badge ${guide.status === 'Active' ? 'active' : 'inactive'}`}>
                    {guide.status === 'Active' ? 'Đang hoạt động' : 'Tạm nghỉ'}
                  </span>
                </div>
              </div>
              
              <div className="guide-details">
                <div className="detail-item">
                  <Award size={16} /> <span>Kinh nghiệm: <strong>{guide.experience_years} năm</strong></span>
                </div>
                <div className="detail-item">
                  <Languages size={16} /> <span>Ngoại ngữ: {guide.languages}</span>
                </div>
                <div className="detail-item">
                  <Phone size={16} /> <span>{guide.phone}</span>
                </div>
                <div className="detail-item">
                  <Mail size={16} /> <span className="truncate-text">{guide.email}</span>
                </div>
              </div>

              <div className="guide-bio">
                <p>{guide.bio}</p>
              </div>

              <div className="guide-actions">
                <button className="action-btn btn-edit" onClick={() => openEditModal(guide)}>
                  <Edit size={16} /> Sửa
                </button>
                <button className="action-btn btn-delete" onClick={() => handleDelete(guide.id)}>
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="guides-modal-overlay">
          <div className="guides-modal">
            <div className="modal-header">
              <h3>{editingGuide ? 'Cập nhật thông tin HDV' : 'Thêm Hướng dẫn viên mới'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{flex: 2}}>
                    <label>Họ và tên</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Trạng thái</label>
                    <select 
                      className="form-input" 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">Đang hoạt động</option>
                      <option value="Inactive">Tạm nghỉ</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Số năm kinh nghiệm</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0"
                      value={formData.experience_years} 
                      onChange={e => setFormData({...formData, experience_years: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="form-group" style={{flex: 2}}>
                    <label>Ngoại ngữ (VD: Tiếng Anh, Tiếng Trung)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.languages} 
                      onChange={e => setFormData({...formData, languages: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>URL Ảnh đại diện (Avatar)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="VD: https://randomuser.me/api/portraits/..." 
                    value={formData.avatar} 
                    onChange={e => setFormData({...formData, avatar: e.target.value})} 
                  />
                </div>

                <div className="form-group">
                  <label>Tiểu sử / Giới thiệu ngắn</label>
                  <textarea 
                    className="form-input" 
                    rows="3"
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-save">
                  {editingGuide ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default AdminGuides;
