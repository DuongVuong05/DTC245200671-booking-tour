import { API_BASE } from '../../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requireOtp, setRequireOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpUsername, setOtpUsername] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, { credentials: 'include', 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requireOtp) {
          setRequireOtp(true);
          setOtpUsername(data.username);
          setError(data.message); // Show message "Mã OTP đã được gửi..."
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('adminUser', JSON.stringify(data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: otpUsername, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Xác thực thất bại');
      }

      // If OTP is verified, trigger login again automatically to get the token
      await handleLogin(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-left-panel">
        <div className="login-overlay"></div>
        <div className="login-left-content">
          <h1>Khám phá vẻ đẹp <br/>Tiềm ẩn của Thế giới.</h1>
          <p>Hệ thống Quản trị Vuo Travel - Cung cấp công cụ quản lý toàn diện cho các chuyến đi, khách hàng, và đối tác vận hành hệ thống.</p>
        </div>
      </div>
      
      <div className="login-right-panel">
        <div className="admin-login-box">
          <div className="logo-area">
            <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '12px', color: '#0ea5e9' }}>
              <Map size={32} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Vuo Travel</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Workspace</span>
            </div>
          </div>
          
          <h2>Chào mừng trở lại!</h2>
          <p className="subtitle">Vui lòng đăng nhập vào tài khoản quản trị.</p>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {requireOtp ? (
            <form onSubmit={handleVerifyOtp}>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Nhập mã OTP 6 số"
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  maxLength={6}
                  required 
                  style={{ letterSpacing: '3px', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', paddingLeft: '20px' }}
                />
              </div>
              <button type="submit" className="login-btn" disabled={otpLoading}>
                {otpLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
              <button type="button" onClick={() => setRequireOtp(false)} style={{width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline'}}>
                Quay lại đăng nhập
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="input-container">
                <Mail className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Tên đăng nhập hoặc Email"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  placeholder="Mật khẩu"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Đang xác thực...' : (
                  <>Đăng Nhập <LogIn size={18}/></>
                )}
              </button>
            </form>
          )}
          
          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
            Bằng việc đăng nhập, bạn đồng ý với <a href="#" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Điều khoản & Bảo mật</a> của chúng tôi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
