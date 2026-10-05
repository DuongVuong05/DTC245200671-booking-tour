import { API_BASE } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Plane, ArrowRight } from 'lucide-react';
import './CustomerAuth.css';

const PHONE_REGEX = /(0|\+84)(3|5|7|8|9)\d{8}$/;

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', phone: '', address: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    document.title = 'Đăng ký | Vuo Travel';
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password || !formData.phone.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, Email, Số điện thoại và Mật khẩu.');
      return;
    }
    if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (formData.password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại');

      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.', redirect: redirect } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=1920')" }}>
        <div className="auth-overlay" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(4, 120, 87, 0.9) 100%)' }}></div>
        <div className="auth-left-content">
          <Plane size={64} style={{ marginBottom: '20px' }} />
          <h1>Trở thành một phần <br/>của Chuyến đi!</h1>
          <p>Đăng ký thành viên để nhận ngay các ưu đãi đặc quyền, quản lý lịch sử đặt tour và tích điểm cho các chuyến đi tiếp theo.</p>
        </div>
      </div>

      <div className="auth-right-panel" style={{ overflowY: 'auto' }}>
        <div className="auth-box">
          <div className="auth-logo" style={{ color: '#10b981' }}>
            <Plane size={32} />
          </div>
          <h2>Tạo tài khoản</h2>
          <p className="auth-subtitle">Đăng ký để nhận những ưu đãi hấp dẫn</p>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input type="text" name="full_name" placeholder="Họ và Tên" aria-label="Họ và Tên" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input type="email" name="email" placeholder="Địa chỉ Email" aria-label="Địa chỉ Email" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <Phone size={18} className="input-icon" />
              <input type="tel" name="phone" placeholder="Số điện thoại" aria-label="Số điện thoại" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <MapPin size={18} className="input-icon" />
              <input type="text" name="address" placeholder="Địa chỉ liên hệ" aria-label="Địa chỉ liên hệ" onChange={handleChange} />
            </div>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input type="password" name="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" aria-label="Mật khẩu" onChange={handleChange} required minLength="6" />
            </div>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" />
            </div>

            <button type="submit" className="auth-btn" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              {loading ? 'Đang tạo...' : (
                <>Đăng Ký Tài Khoản <ArrowRight size={18}/></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Đã có tài khoản? <Link to={redirect ? `/login?redirect=${redirect}` : "/login"} style={{ color: '#10b981' }}>Đăng nhập ngay</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>&larr; Trở về Trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
