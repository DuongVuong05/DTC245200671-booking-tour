# Booking Tour — Frontend (React + Vite)

Giao diện khách hàng (đặt tour) + trang quản trị (admin).

## Chạy môi trường dev

```bash
npm install
npm run dev          # chạy trên http://localhost:5173
```

Dev mặc định gọi API trực tiếp tại `http://localhost:3000` (cần backend đang chạy).
Có thể override bằng biến env `VITE_API_URL` khi build.

## Build production

```bash
npm run build        # output vào dist/
```

Khi deploy qua Docker/nginx, API được gọi cùng origin thông qua proxy `/api` (xem `nginx.conf` và docker-compose ở thư mục gốc).

## Lint

```bash
npm run lint         # oxlint
```

## Cấu trúc

- `src/config.js` — API base URL (`API_BASE`, `API_ORIGIN`, `resolveImageUrl`)
- `src/api.js` — `apiFetch` (tự thêm credentials + redirect khi 401), `getLocalUser`, `formatDateInput`
- `src/pages/` — trang khách hàng
- `src/pages/admin/` — trang quản trị
