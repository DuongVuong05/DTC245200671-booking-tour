import { API_BASE } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Plane, ArrowRight } from 'lucide-react';
import './CustomerAuth.css';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const successMsg = location.state?.message;
  const redirectUrl = searchParams.get('redirect') || location.state?.redirect || '/';

  useEffect(() => {
    document.title = 'Đăng nhập | Vuo Travel';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      localStorage.setItem('customerUser', JSON.stringify(data.user));
      navigate(redirectUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        <div className="auth-overlay"></div>
        <div className="auth-left-content">
          <Plane size={64} style={{ marginBottom: '20px' }} />
          <h1>Bắt đầu hành trình của bạn!</h1>
          <p>Tham gia cùng hàng ngàn du khách khác để khám phá những vùng đất mới, trải nghiệm văn hóa độc đáo và tạo nên những kỷ niệm khó quên cùng Vuo Travel.</p>
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="auth-box">
          <div className="auth-logo">
            <Plane size={32} />
          </div>
          <h2>Đăng nhập</h2>
          <p className="auth-subtitle">Mừng bạn trở lại với Vuo Travel</p>
          
          {successMsg && <div className="auth-success">{successMsg}</div>}
          {error && <div className="auth-error" role="alert">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="Địa chỉ Email" aria-label="Địa chỉ Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="Mật khẩu" aria-label="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : (
                <>Đăng nhập <ArrowRight size={18}/></>
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            Chưa có tài khoản? <Link to={redirectUrl !== '/' ? `/register?redirect=${redirectUrl}` : "/register"}>Đăng ký ngay</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link to="/lien-he" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>Quên mật khẩu?</Link>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>&larr; Trở về Trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
