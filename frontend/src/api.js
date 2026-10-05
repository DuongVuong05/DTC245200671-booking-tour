import { API_BASE } from './config';

// Chuyển giá trị ngày (ISO string từ API) thành chuỗi YYYY-MM-DD theo
// timezone local của trình duyệt — tránh lệch 1 ngày khi split chuỗi UTC
export const formatDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Đọc user từ localStorage an toàn (không crash khi dữ liệu hỏng)
export const getLocalUser = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

// Phiên hết hạn (401): xóa session và chuyển về trang đăng nhập tương ứng
export const handleSessionExpired = (isAdmin) => {
  if (isAdmin) {
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  } else {
    localStorage.removeItem('customerUser');
    window.location.href = '/login';
  }
};

/**
 * Gọi API kèm credentials; tự chuyển hướng về trang login khi nhận 401.
 * path có thể là đường dẫn tương đối ('/api/tours') hoặc URL đầy đủ.
 */
export const apiFetch = async (path, options = {}, { isAdmin = true } = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { credentials: 'include', ...options });
  if (res.status === 401) {
    handleSessionExpired(isAdmin);
  }
  return res;
};
