import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';
import { Plus, Edit, Trash2, Video, Image as ImageIcon, X, Compass } from 'lucide-react';
import { apiFetch } from '../../api';
import './AdminExplore.css';

const AdminExplore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', img: '', icon: '', detail: '', has_video: false, video_url: ''
  });

  const loadItems = () => {
    setLoading(true);
    apiFetch(`/api/explore`)
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadItems(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', img: '', icon: '', detail: '', has_video: false, video_url: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if(!window.confirm("Bạn có chắc muốn xóa mục này?")) return;
    apiFetch(`/api/explore/${id}`, {
      method: 'DELETE'
    }).then(() => loadItems());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingItem ? 'PUT' : 'POST';
    const path = editingItem ? `/api/explore/${editingItem.id}` : `/api/explore`;

    apiFetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowModal(false);
      loadItems();
    });
  };

  return (
    <div className="explore-container">
      <div className="explore-header-panel">
        <div className="explore-title-group">
          <h2>Quản lý Khám Phá</h2>
          <p>Quản lý các chuyên mục khám phá Bắc Ninh trên trang chủ</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <Plus size={20} />
          <span>Thêm mục mới</span>
        </button>
      </div>

      {loading ? (
        <div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}>
          <div className="spinner" style={{width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        </div>
      ) : (
        <div className="explore-grid">
          {items.map(item => (
            <div className="explore-card" key={item.id}>
              <div className="card-image-wrap">
                <img src={item.img} alt={item.title} className="card-image" />
                {item.has_video ? (
                  <div className="media-badge video">
                    <Video size={14} /> Video
                  </div>
                ) : (
                  <div className="media-badge image">
                    <ImageIcon size={14} /> Ảnh
                  </div>
                )}
              </div>
              <div className="card-content">
                <div className="card-header">
                  <div className="icon-box">{item.icon}</div>
                  <h3 className="card-title">{item.title}</h3>
                </div>
                <p className="card-desc">{item.description}</p>
                <div className="card-actions">
                  <button className="action-btn btn-edit" onClick={() => openEditModal(item)}>
                    <Edit size={16} /> Sửa
                  </button>
                  <button className="action-btn btn-delete" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="explore-modal-overlay">
          <div className="explore-modal">
            <div className="modal-header">
              <h3>{editingItem ? 'Sửa chuyên mục' : 'Thêm chuyên mục mới'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{flex: 2}}>
                    <label>Tiêu đề</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="VD: Văn hóa, Lịch sử..." 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Biểu tượng (Icon)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="VD: 🎵, 🏛️" 
                      required 
                      value={formData.icon} 
                      onChange={e => setFormData({...formData, icon: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>Mô tả ngắn</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="VD: Khám phá những làn điệu dân ca..." 
                    required 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>URL Ảnh đại diện</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="VD: /images/van-hoa.jpg" 
                    required 
                    value={formData.img} 
                    onChange={e => setFormData({...formData, img: e.target.value})} 
                  />
                </div>

                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label>Chi tiết nội dung</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Nhập nội dung chi tiết hiển thị trong popup..." 
                    required 
                    value={formData.detail} 
                    onChange={e => setFormData({...formData, detail: e.target.value})} 
                  />
                </div>

                <div className="toggle-group">
                  <input 
                    type="checkbox" 
                    id="hasVideoToggle" 
                    style={{width: '18px', height: '18px', accentColor: '#0ea5e9'}}
                    checked={formData.has_video} 
                    onChange={e => setFormData({...formData, has_video: e.target.checked})} 
                  />
                  <label htmlFor="hasVideoToggle" style={{margin: 0, cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, color: '#334155'}}>
                    Mục này chứa Video thay vì Ảnh?
                  </label>
                </div>

                {formData.has_video && (
                  <div className="form-group" style={{animation: 'fadeIn 0.3s'}}>
                    <label>URL Video</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="VD: https://youtube.com/... hoặc /videos/vid1.mp4" 
                      value={formData.video_url || ''} 
                      onChange={e => setFormData({...formData, video_url: e.target.value})} 
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-save">
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
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

export default AdminExplore;
