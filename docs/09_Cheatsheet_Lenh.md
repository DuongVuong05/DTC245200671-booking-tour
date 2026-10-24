# 09. TỔNG HỢP CÂU LỆNH HỆ THỐNG (COMMAND CHEATSHEET)

---

## NGUYÊN TẮC SỬ DỤNG
- Tài liệu phân chia rõ ràng giữa môi trường **Windows PowerShell** (cho máy cá nhân của sinh viên) và **Linux Bash** (cho máy chủ VPS hoặc terminal bên trong container).
- Mỗi lệnh đều có giải thích mục đích và kết quả mong đợi ngay bên dưới.
- Các lệnh có nguy cơ xóa dữ liệu được đánh dấu cảnh báo màu đỏ đặc biệt.

---

## 1. NHÓM LỆNH GIT VÀ QUẢN LÝ PHIÊN BẢN

### Windows PowerShell & Linux (Chung cú pháp Git)

```bash
# 1.1. Xem lịch sử commit rút gọn (rất phù hợp để chiếu lên màn hình)
git log --format="%h | %ad | %s" --date=short -n 10
# Giải thích: Hiển thị 10 commit gần nhất gồm: mã hash ngắn, ngày commit, và thông điệp.

# 1.2. Xem trạng thái các file đang thay đổi
git status
# Giải thích: Kiểm tra xem có file nào chưa add (untracked) hoặc chưa commit hay không.

# 1.3. Xem chi tiết các file thay đổi trong một commit cụ thể
git show --stat b8534da
# Giải thích: Liệt kê danh sách các file được thêm/sửa trong commit b8534da (Monitoring).

# 1.4. So sánh sự thay đổi giữa commit hiện tại và commit trước đó
git diff HEAD~1 HEAD nginx/nginx.conf
# Giải thích: Xem chi tiết từng dòng code thay đổi trong file nginx.conf.

# 1.5. Cất tạm các thay đổi đang làm dở khi cần chuyển nhánh
git stash
# Giải thích: Lưu tạm code chưa commit vào bộ nhớ đệm của Git.

# 1.6. Khôi phục lại các thay đổi đã cất tạm
git stash pop
# Giải thích: Lấy lại các thay đổi từ bộ nhớ đệm ra thư mục làm việc.
```

---

## 2. NHÓM LỆNH ĐIỀU PHỐI DOCKER COMPOSE

### Khởi chạy và Quản lý Vòng đời

| Mục đích | Lệnh chạy (Windows PowerShell & Linux) | Giải thích chi tiết |
|---|---|---|
| **Khởi chạy toàn bộ hệ thống ngầm** | `docker compose up -d` | Bật toàn bộ 10 container dưới dạng tiến trình nền (Detached mode). |
| **Build lại image và khởi chạy** | `docker compose up -d --build` | Biên dịch lại image mới từ Dockerfile và khởi chạy (dùng khi vừa sửa code). |
| **Kiểm tra trạng thái các container** | `docker compose ps` | Hiển thị bảng trạng thái (Up, Exited, Healthy) và cổng của 10 container. |
| **Tạm dừng hệ thống (Không xóa)** | `docker compose stop` | Dừng các tiến trình, giữ nguyên container và mạng ảo. |
| **Bật lại hệ thống đã dừng** | `docker compose start` | Khởi động lại các container đã bị stop trước đó. |
| **Dừng và xóa bỏ container, mạng** | `docker compose down` | Dừng và giải phóng container, mạng ảo; **giữ nguyên dữ liệu trong Volume**. |
| **Khởi động lại một service cụ thể** | `docker compose restart backend` | Khởi động lại riêng container backend mà không ảnh hưởng service khác. |

### Đọc Log Hệ thống

```bash
# 2.1. Xem log thời gian thực của toàn bộ hệ thống
docker compose logs -f

# 2.2. Xem log riêng của Backend Node.js
docker compose logs -f backend

# 2.3. Xem 50 dòng log gần nhất của Nginx
docker compose logs --tail 50 nginx

# 2.4. Xem log của container Postgres khi nghi ngờ lỗi kết nối
docker compose logs postgres
```

### Giám sát Tài nguyên Phần cứng Container

```bash
# Xem CPU, RAM, Network I/O tức thời của toàn bộ 10 container
docker stats --no-stream
# Giải thích: Hiển thị bảng chụp nhanh tài nguyên tiêu thụ của từng container.
```

---

## 3. NHÓM LỆNH THAO TÁC CƠ SỞ DỮ LIỆU POSTGRESQL

```bash
# 3.1. Đăng nhập trực tiếp vào dòng lệnh psql bên trong container
docker exec -it booking-postgres psql -U booking_admin -d booking_tour
# Giải thích: Mở phiên làm việc tương tác với PostgreSQL qua tài khoản booking_admin.

# 3.2. Liệt kê danh sách tất cả các bảng dữ liệu (không cần vào psql)
docker exec booking-postgres psql -U booking_admin -d booking_tour -c "\dt"

# 3.3. Đếm số lượng bản ghi trong toàn bộ 9 bảng
docker exec booking-postgres psql -U booking_admin -d booking_tour -c "SELECT 'tours' as tbl, count(*) FROM tours UNION ALL SELECT 'users', count(*) FROM users UNION ALL SELECT 'customers', count(*) FROM customers UNION ALL SELECT 'bookings', count(*) FROM bookings;"

# 3.4. Xem đơn đặt tour mới nhất vừa được tạo
docker exec booking-postgres psql -U booking_admin -d booking_tour -c "SELECT id, customer_id, num_people, total_price, status, booking_date FROM bookings ORDER BY id DESC LIMIT 1;"

# 3.5. Kiểm tra sức khỏe kết nối của cơ sở dữ liệu
docker exec booking-postgres pg_isready -U booking_admin -d booking_tour
# Kết quả mong đợi: booking-postgres:5432 - accepting connections

# 3.6. Sao lưu (Backup) toàn bộ cơ sở dữ liệu ra file SQL trên máy host
# Windows PowerShell:
docker exec booking-postgres pg_dump -U booking_admin booking_tour > backup_booking_tour.sql
# Linux:
docker exec booking-postgres pg_dump -U booking_admin booking_tour > backup_booking_tour.sql

# 3.7. Khôi phục (Restore) cơ sở dữ liệu từ file SQL
# Linux:
docker exec -i booking-postgres psql -U booking_admin -d booking_tour < backup_booking_tour.sql
# Windows PowerShell:
Get-Content backup_booking_tour.sql | docker exec -i booking-postgres psql -U booking_admin -d booking_tour
```

---

## 4. NHÓM LỆNH KIỂM TRA NGINX REVERSE PROXY VÀ HTTP

### Windows PowerShell

```powershell
# 4.1. Kiểm tra Response Headers của Nginx (chứng minh server và security headers)
curl.exe -I http://localhost:8888/
# Kết quả: Thấy Server: nginx/1.31.6, X-Frame-Options, Content-Security-Policy...

# 4.2. Kiểm tra mã phản hồi HTTP của trang chủ
(Invoke-WebRequest -Uri "http://localhost:8888/" -UseBasicParsing).StatusCode
# Kết quả: 200

# 4.3. Kiểm tra định tuyến API danh sách tour qua cổng Nginx 8888
curl.exe -s -o $null -w "%{http_code}`n" http://localhost:8888/api/tours
# Kết quả: 200

# 4.4. Kiểm tra cấu hình Nginx bên trong container có bị lỗi cú pháp không
docker exec booking-nginx nginx -t
# Kết quả: nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
```

### Linux / macOS

```bash
# 4.1. Kiểm tra Response Headers
curl -I http://localhost:8888/

# 4.2. Kiểm tra mã phản hồi HTTP
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888/api/tours

# 4.3. Kiểm tra cú pháp Nginx
docker exec booking-nginx nginx -t

# 4.4. Tải lại cấu hình Nginx mà không cần dừng container (Hot Reload)
docker exec booking-nginx nginx -s reload
```

---

## 5. NHÓM LỆNH KIỂM TRA METRICS PROMETHEUS VÀ GRAFANA

```bash
# 5.1. Kiểm tra trạng thái 3 Target qua API của Prometheus
# Windows PowerShell:
curl.exe -s http://localhost:9090/api/v1/targets | Select-String '"health":"up"'
# Linux:
curl -s http://localhost:9090/api/v1/targets | grep -o '"health":"up"'

# 5.2. Đọc trực tiếp dữ liệu metrics do Backend Node.js xuất ra
curl.exe -s http://localhost:3000/metrics | Select-String "http_requests_total"

# 5.3. Kiểm tra metrics từ Postgres-Exporter (thực hiện qua container prometheus)
docker exec booking-prometheus wget -qO- http://postgres-exporter:9187/metrics | grep "pg_stat_database_numbackends"

# 5.4. Chạy truy vấn PromQL tức thời qua API của Prometheus
# Lấy tổng số request HTTP:
curl.exe -s -G "http://localhost:9090/api/v1/query" --data-urlencode "query=sum(http_requests_total)"

# 5.5. Kiểm tra sức khỏe của dịch vụ Grafana
curl.exe -s http://localhost:3001/api/health
# Kết quả: {"commit":"...","database":"ok","version":"10.4.0"}
```

---

## 6. NHÓM LỆNH KIỂM TRA LOG TẬP TRUNG LOKI VÀ PROMTAIL

```bash
# 6.1. Kiểm tra danh sách nhãn (Labels) mà Loki đang lưu trữ
curl.exe -s http://localhost:3100/loki/api/v1/labels
# Kết quả: {"status":"success","data":["container_name","service_name"]}

# 6.2. Kiểm tra danh sách các container đã được nạp log vào Loki
curl.exe -s http://localhost:3100/loki/api/v1/label/container_name/values
# Kết quả: Mảng JSON chứa đủ 10 container booking-*

# 6.3. Chạy truy vấn LogQL lấy 2 dòng log Nginx mới nhất qua API của Loki
# Windows PowerShell:
curl.exe -s -G "http://localhost:3100/loki/api/v1/query_range" --data-urlencode "query={container_name=`"booking-nginx`"}" --data-urlencode "limit=2"
# Linux:
curl -s -G "http://localhost:3100/loki/api/v1/query_range" --data-urlencode 'query={container_name="booking-nginx"}' --data-urlencode "limit=2"

# 6.4. Kiểm tra sức khỏe của dịch vụ Loki
curl.exe -s http://localhost:3100/ready
# Kết quả: ready
```

---

## 7. NHÓM LỆNH KIỂM CHỨNG BẢO MẬT VÀ HARDENING

```bash
# 7.1. Chứng minh container chạy Non-root (UID khác 0)
docker exec booking-backend id
# Kết quả: uid=1000(node) gid=1000(node)
docker exec booking-nginx id
# Kết quả: uid=101(nginx) gid=101(nginx)

# 7.2. Chứng minh Cô lập mạng (Nginx bị cấm kết nối tới Postgres)
docker exec booking-nginx ping -c 1 postgres
# Kết quả mong đợi: ping: bad address 'postgres'

# 7.3. Chứng minh file cấu hình và Docker Socket được mount Chỉ đọc (:ro)
# Windows PowerShell:
docker inspect booking-promtail --format="{{json .Mounts}}" | Select-String "docker.sock"
# Trong kết quả sẽ thấy trường "RW": false (nghĩa là Read-Only)

# 7.4. Kiểm tra danh sách 4 mạng Docker độc lập của dự án
docker network ls --filter name=booking-tour
# Kết quả: backend-net, db-net, frontend-net, monitor-net
```

---

## 8. CÁC LỆNH NGUY HIỂM CÓ NGUY CƠ MẤT DỮ LIỆU (CẢNH BÁO CAO)

> [!CAUTION]
> **CẢNH BÁO MẤT DỮ LIỆU VĨNH VIỄN:**
> Các lệnh dưới đây có thể xóa sạch cơ sở dữ liệu, các bản ghi đặt tour, tài khoản và hình ảnh tải lên. **TUYỆT ĐỐI KHÔNG CHẠY** trước hoặc trong buổi thi vấn đáp trừ khi có yêu cầu đặc biệt từ giảng viên!

### 1. `docker compose down -v` (hoặc `--volumes`)
- **Tác hại:** Xóa sạch các container VÀ XÓA LUÔN các Named Volumes (`postgres_data`, `uploads_data`, `loki_data`). Toàn bộ dữ liệu đặt tour và lịch trình sẽ biến mất vĩnh viễn, database trở về trạng thái rỗng!
- **Lệnh an toàn thay thế:** Chỉ dùng `docker compose down` (không có cờ `-v`).

### 2. `docker system prune -a --volumes`
- **Tác hại:** Xóa sạch toàn bộ mọi image, container tắt và tất cả các volume trên toàn bộ máy tính cá nhân.
- **Lệnh an toàn thay thế:** `docker system prune` (không có cờ `-a` và không có `--volumes`).

### 3. `DROP DATABASE booking_tour;`
- **Tác hại:** Lệnh SQL xóa sổ toàn bộ cơ sở dữ liệu bên trong PostgreSQL.
