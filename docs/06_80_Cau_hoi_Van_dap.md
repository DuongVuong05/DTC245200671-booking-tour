# 06. BỘ 80 CÂU HỎI VẤN ĐÁP VÀ TRẢ LỜI CHUYÊN SÂU

---

## MỤC LỤC 10 NHÓM CÂU HỎI
- [Nhóm 1: Tổng quan Kiến trúc Hệ thống (Câu 1 - 8)](#nhóm-1-tổng-quan-kiến-trúc-hệ-thống)
- [Nhóm 2: Git và Quản lý Mã nguồn GitHub (Câu 9 - 16)](#nhóm-2-git-và-quản-lý-mã-nguồn-github)
- [Nhóm 3: Docker và Docker Compose (Câu 17 - 28)](#nhóm-3-docker-và-docker-compose)
- [Nhóm 4: PostgreSQL và pgAdmin 4 (Câu 29 - 38)](#nhóm-4-postgresql-và-pgadmin-4)
- [Nhóm 5: Nginx và Reverse Proxy (Câu 39 - 48)](#nhóm-5-nginx-và-reverse-proxy)
- [Nhóm 6: Prometheus và Grafana Monitoring (Câu 49 - 58)](#nhóm-6-prometheus-và-grafana-monitoring)
- [Nhóm 7: Loki, Promtail và LogQL (Câu 59 - 68)](#nhóm-7-loki-promtail-và-logql)
- [Nhóm 8: Hardening và Bảo mật Hệ thống (Câu 69 - 76)](#nhóm-8-hardening-và-bảo-mật-hệ-thống)
- [Nhóm 9: Xử lý Sự cố Thực tế (Troubleshooting) (Câu 77 - 82)](#nhóm-9-xử-lý-sự-cố-thực-tế)
- [Nhóm 10: Phản biện Nâng cao và Thiết kế Hệ thống (Câu 83 - 88)](#nhóm-10-phản-biện-nâng-cao-và-thiết-kế-hệ-thống)

---

## NHÓM 1: TỔNG QUAN KIẾN TRÚC HỆ THỐNG

### Câu 1: Em hãy trình bày tổng quan hệ thống của em gồm những dịch vụ gì và kiến trúc tổng thể ra sao?
- **Câu trả lời sinh viên:** Dạ thưa thầy, đề tài số 20 của em là Hệ thống Booking Tour Du lịch Kinh Bắc. Hệ thống gồm 10 container dịch vụ điều phối bằng Docker Compose: Nginx làm Gateway tại cổng 8888, Frontend React đóng gói tĩnh, Backend Node.js Express xử lý API, PostgreSQL 16 lưu dữ liệu, pgAdmin cổng 5050 để quản trị DB. Tầng giám sát có Prometheus và Postgres-Exporter thu thập metrics, Grafana cổng 3001 hiển thị dashboard, cùng bộ đôi Loki và Promtail thu thập log tập trung qua Docker Socket.
- **Bản chất kỹ thuật:** Hệ thống xây dựng theo kiến trúc phân tầng (Multi-tier) cô lập qua 4 mạng Docker Bridge (`frontend-net`, `backend-net`, `db-net`, `monitor-net`) đảm bảo tính sẵn sàng và an toàn thông tin.
- **File bằng chứng:** `docker-compose.yml`, `README.md`.
- **Câu hỏi truy vấn sâu:** *Tại sao em lại tách Frontend và Backend thành 2 container riêng thay vì gộp chung vào một image Node.js duy nhất?*
- **Câu trả lời tiếp theo:** Dạ, việc tách biệt giúp tối ưu hóa tài nguyên và nguyên lý đơn nhiệm (Single Responsibility). Frontend là các file tĩnh (HTML/CSS/JS) được phục vụ bởi Nginx Unprivileged tiêu tốn rất ít RAM và có thể scale độc lập, còn Backend Node.js chỉ tập trung tính toán logic và kết nối cơ sở dữ liệu.

---

### Câu 2: Luồng đi của một request từ trình duyệt khi người dùng đặt tour diễn ra như thế nào?
- **Câu trả lời sinh viên:** Dạ, người dùng truy cập `http://localhost:8888`. Request gửi đến cổng 8888 của Nginx. Nginx proxy request `/` sang Frontend để tải giao diện React. Khi khách hàng bấm "Đặt tour", trình duyệt gửi `POST /api/bookings` tới cổng 8888. Nginx nhận diện tiền tố `/api/` và proxy ngầm sang `backend:3000`. Backend xác thực token, kiểm tra số chỗ và dùng Transaction khóa dòng `FOR UPDATE` trong PostgreSQL. Khi lưu đơn thành công, Backend trả JSON về Nginx và Nginx trả về trình duyệt.
- **Bản chất kỹ thuật:** Nginx đóng vai trò Reverse Proxy định tuyến theo Path-based Routing (`/` -> frontend:8080, `/api/` -> backend:3000), đồng thời triệt tiêu lỗi CORS vì cả UI và API đều chung nguồn gốc cổng 8888.
- **File bằng chứng:** `nginx/nginx.conf` (dòng 15-29), `backend/src/controllers/bookingController.js` (dòng 27-206).
- **Câu hỏi truy vấn sâu:** *Nếu Backend mất 10 giây mới xử lý xong đặt tour thì người dùng có bị đơ trình duyệt không?*
- **Câu trả lời tiếp theo:** Dạ không thưa thầy, vì trên Frontend em sử dụng hàm gọi bất đồng bộ `fetch` / `Promise` trong React, giao diện hiển thị trạng thái loading; còn ở Backend việc gửi email xác nhận đặt tour được tách thành tác vụ bất đồng bộ nền (`.catch()`), không chặn luồng trả lời HTTP response.

---

### Câu 3: Trong 10 thành phần này, thành phần nào do em tự phát triển và thành phần nào là công cụ hạ tầng có sẵn?
- **Câu trả lời sinh viên:** Dạ, phần em trực tiếp phát triển mã nguồn là toàn bộ mã nguồn Backend (Node.js/Express, các controller, database migration, logic transaction), mã nguồn Frontend (React Vite, các component giao diện, css) và script khởi tạo cơ sở dữ liệu `init.sql`. Còn các công cụ hạ tầng gồm PostgreSQL, pgAdmin, Nginx, Prometheus, Grafana, Loki, Promtail, Postgres-Exporter là các image mã nguồn mở chuẩn, được em tự tay viết các file cấu hình `docker-compose.yml`, `nginx.conf`, `prometheus.yml`, `datasources.yml`, `dashboards.json`, `loki-config.yml`, `promtail-config.yml` để liên kết chúng thành hệ thống hoàn chỉnh.
- **Bản chất kỹ thuật:** Phân định rõ giữa Business Application Layer (tự viết) và Infrastructure / Observability Layer (cấu hình và tích hợp).
- **File bằng chứng:** Các thư mục `backend/`, `frontend/`, `database/init.sql` đối chiếu với các thư mục cấu hình `nginx/`, `prometheus/`, `grafana/`, `loki/`, `promtail/`.
- **Câu hỏi truy vấn sâu:** *Thế bảng Dashboard trên Grafana là em lấy mẫu trên mạng hay tự dựng?*
- **Câu trả lời tiếp theo:** Dạ, file `grafana/dashboards/booking-tour-overview.json` là dashboard do em tự cấu hình khớp chính xác với các metrics thực tế của dự án: đo route API từ `prom-client`, đo transaction và số kết nối từ Postgres-Exporter, và nhúng cả các truy vấn LogQL của Loki.

---

### Câu 4: Tại sao hệ thống lại cần Nginx khi trình duyệt hoàn toàn có thể gọi trực tiếp Backend cổng 3000 và Frontend cổng 8082?
- **Câu trả lời sinh viên:** Dạ, nếu mở cổng trực tiếp thì: Thứ nhất, trình duyệt sẽ chặn request do vi phạm chính sách cùng nguồn gốc (CORS) khi frontend ở port 8082 gọi backend ở port 3000. Thứ hai, việc mở nhiều cổng làm tăng bề mặt tấn công của hệ thống. Thứ ba, người dùng phải nhớ nhiều cổng khác nhau. Nginx giải quyết cả 3 vấn đề: làm Gateway duy nhất ở cổng 8888, triệt tiêu lỗi CORS và gắn các header bảo mật tập trung.
- **Bản chất kỹ thuật:** Single Entry Point Pattern giúp trừu tượng hóa kiến trúc mạng nội bộ đối với bên ngoài (Security by Abstraction).
- **File bằng chứng:** `docker-compose.yml` (các dòng port 8082 và 5433 đã comment), `nginx/nginx.conf`.
- **Câu hỏi truy vấn sâu:** *Nếu Nginx bị sập thì toàn bộ hệ thống có sập theo không? Làm sao để khắc phục điểm nghẽn đơn độc này?*
- **Câu trả lời tiếp theo:** Dạ có, Nginx khi đó là Single Point of Failure (SPOF). Trong môi trường sản xuất thực tế, người ta sẽ khắc phục bằng cách chạy cụm 2 hoặc nhiều Nginx kết hợp với cơ chế IP ảo như Keepalived (VRRP) hoặc đặt trước một Load Balancer đám mây (như AWS ALB hay Cloudflare).

---

### Câu 5: Hệ thống của em có khả năng lưu trữ bền vững (Persistent) không? Nếu tắt máy thì dữ liệu có mất không?
- **Câu trả lời sinh viên:** Dạ hoàn toàn không mất dữ liệu thưa thầy. Hệ thống sử dụng 3 Docker Named Volumes: `postgres_data` lưu trữ thư mục dữ liệu của PostgreSQL, `uploads_data` lưu trữ hình ảnh tải lên của tour, và `loki_data` lưu trữ các khối log của Loki. Các volume này nằm độc lập trên ổ cứng máy host, không phụ thuộc vào vòng đời của container.
- **Bản chất kỹ thuật:** Tách rời dữ liệu trạng thái (State) ra khỏi tiến trình tính toán vô trạng thái (Stateless Containers).
- **File bằng chứng:** `docker-compose.yml` (khối `volumes:` ở cuối file dòng 176-180).
- **Câu hỏi truy vấn sâu:** *Lệnh nào trong Docker Compose sẽ làm mất dữ liệu của các volume này?*
- **Câu trả lời tiếp theo:** Dạ, đó là lệnh `docker compose down -v` (hoặc `--volumes`). Cờ `-v` sẽ xóa sạch cả các named volume đã được khai báo. Vì vậy khi bảo trì chỉ chạy `docker compose down`, tuyệt đối không thêm cờ `-v`.

---

### Câu 6: Dịch vụ nào trong hệ thống tiêu tốn tài nguyên nhất và em đã làm gì để kiểm soát?
- **Câu trả lời sinh viên:** Dạ, trong hệ thống thì PostgreSQL và tiến trình Backend Node.js khi xử lý nhiều truy vấn là hai dịch vụ tốn tài nguyên nhất. Để kiểm soát, em đã cấu hình giới hạn tài nguyên (Resource Limits) trong `docker-compose.yml`: giới hạn `booking-backend` tối đa 512MB RAM và `booking-nginx` tối đa 256MB RAM để tránh việc một container bị rò rỉ bộ nhớ làm treo toàn bộ máy host.
- **Bản chất kỹ thuật:** Docker Compose sử dụng thuộc tính `deploy.resources.limits.memory` để áp đặt tham số cấu hình cgroups lên Linux kernel.
- **File bằng chứng:** `docker-compose.yml` (dòng 62-65 và dòng 111-114).
- **Câu hỏi truy vấn sâu:** *Nếu Backend vượt quá ngưỡng 512MB RAM thì điều gì sẽ xảy ra?*
- **Câu trả lời tiếp theo:** Dạ, tiến trình trong container sẽ bị cơ chế Out-Of-Memory Killer (OOM Killer) của nhân Linux bắn hạ ngay lập tức với mã thoát 137. Nhờ có cấu hình `restart: unless-stopped`, Docker sẽ tự động khởi động lại container mới.

---

### Câu 7: Website của em đã có những trang và chức năng nghiệp vụ thực tế nào?
- **Câu trả lời sinh viên:** Dạ, về phía khách hàng có: Trang chủ hiển thị 6 tour nổi bật Kinh Bắc và mục Khám phá văn hóa Quan họ; Trang danh sách tour có lọc theo giá, điểm đến; Trang chi tiết tour; Trang đặt tour có áp mã voucher và transaction giữ chỗ; Trang tra cứu đơn công khai theo mã đơn + SĐT; và Trang cá nhân để khách tự xem và hủy đơn. Về phía Admin: có Dashboard thống kê doanh thu, CRUD quản lý Tour, Lịch trình, Hướng dẫn viên, Phương tiện, Mã giảm giá, và duyệt trạng thái đơn booking.
- **Bản chất kỹ thuật:** Hệ thống là ứng dụng full-stack hoàn chỉnh, toàn bộ dữ liệu hiển thị đều truy vấn từ 9 bảng trong PostgreSQL, không dùng dữ liệu cứng (mock data).
- **File bằng chứng:** `database/init.sql` (chứa dữ liệu khởi tạo 6 tour và lịch trình), `frontend/src/App.jsx`.
- **Câu hỏi truy vấn sâu:** *Chức năng đặt phòng khách sạn (/hotels) trên web đã hoạt động chưa?*
- **Câu trả lời tiếp theo:** Dạ chưa thưa thầy, trang `/hotels` hiện tại hiển thị trạng thái "Coming Soon" (Sắp ra mắt), em chưa triển khai lưu trữ booking khách sạn giả lập để đảm bảo tính trung thực của mã nguồn.

---

### Câu 8: Tại sao em lại chọn PostgreSQL 16 mà không chọn MongoDB hay MySQL?
- **Câu trả lời sinh viên:** Dạ, nghiệp vụ Đặt tour du lịch đòi hỏi tính toàn vẹn dữ liệu cực kỳ khắt khe (chuẩn ACID), đặc biệt là quan hệ giữa Tour -> Lịch trình -> Đơn đặt chỗ -> Khách hàng và quản lý số lượng ghế ngồi. PostgreSQL hỗ trợ rất mạnh mẽ các ràng buộc khóa ngoại, CHECK constraints, và đặc biệt là cơ chế khóa dòng `SELECT ... FOR UPDATE` giúp xử lý chống bán quá số chỗ (Overbooking) tốt hơn hẳn so với cơ chế NoSQL như MongoDB.
- **Bản chất kỹ thuật:** RDBMS với ACID Transactions và Row-level locking là lựa chọn tối ưu cho nghiệp vụ tài chính, vé và chỗ ngồi.
- **File bằng chứng:** `database/init.sql` (ràng buộc CHECK và khóa ngoại), `backend/src/controllers/bookingController.js`.
- **Câu hỏi truy vấn sâu:** *PostgreSQL 16 có tính năng gì mới nổi bật so với các bản trước?*
- **Câu trả lời tiếp theo:** Dạ, bản 16 cải tiến mạnh mẽ về hiệu năng truy vấn song song (Parallel Query), tăng tốc độ sao chép logic (Logical Replication) và cải thiện thống kê I/O trong bảng `pg_stat_io`.

---

## NHÓM 2: GIT VÀ QUẢN LÝ MÃ NGUỒN GITHUB

### Câu 9: Em hãy cho biết quy trình phát triển và các commit thực tế của dự án trên Git?
- **Câu trả lời sinh viên:** Dạ, lịch sử Git thực tế của dự án em có 5 commit tuần tự:
  1. `46c4910`: Khởi tạo mã nguồn Backend ban đầu.
  2. `5e8a5a6`: Triển khai hệ thống booking tour, PostgreSQL và Nginx Reverse Proxy kèm Security Headers.
  3. `b8534da`: Triển khai hệ thống giám sát Prometheus và Grafana.
  4. `307fbe4`: Triển khai hệ thống quản trị log tập trung Loki và Promtail.
  5. `ab7d513`: Cập nhật hoàn thiện tài liệu README với commit hash thực tế, API và hướng dẫn demo.
- **Bản chất kỹ thuật:** Phản ánh đúng 3 cột mốc nâng cấp hạ tầng môn học: Gateway Proxy -> Monitoring -> Centralized Logging.
- **File bằng chứng:** Kết quả lệnh `git log --oneline`.
- **Câu hỏi truy vấn sâu:** *Làm thế nào để thầy kiểm tra được commit `b8534da` thực sự đã thêm những file nào?*
- **Câu trả lời tiếp theo:** Dạ, thầy có thể chạy lệnh `git show --stat b8534da` để xem danh sách các file được thêm mới (như `prometheus/prometheus.yml`, `grafana/dashboards/...`), hoặc dùng `git diff b8534da^! [tên_file]` để xem chi tiết từng dòng code thay đổi.

---

### Câu 10: Tại sao file `.env` không được phép đưa lên GitHub và em quản lý nó như thế nào?
- **Câu trả lời sinh viên:** Dạ, file `.env` chứa các thông tin bí mật tối mật của hệ thống như mật khẩu cơ sở dữ liệu `POSTGRES_PASSWORD`, khóa ký JWT `JWT_SECRET`, và mật khẩu ứng dụng Gmail SMTP. Nếu đưa lên GitHub công khai, bot quét tự động của hacker có thể lấy cắp để phá hoại database hoặc lợi dụng tài khoản email gửi thư rác. Em đã cấu hình file `.gitignore` chứa dòng `.env`, và chỉ đẩy file mẫu `.env.example` lên Git để người khác biết cấu trúc biến.
- **Bản chất kỹ thuật:** Nguyên tắc quản lý Secrets Management trong phương pháp luận Twelve-Factor App (Phần III: Config).
- **File bằng chứng:** `.gitignore`, `.env.example`.
- **Câu hỏi truy vấn sâu:** *Nếu lỡ tay commit file `.env` lên GitHub rồi thì xóa file đó đi và commit đè lên có an toàn không?*
- **Câu trả lời tiếp theo:** Dạ không an toàn thưa thầy, vì Git lưu lại toàn bộ lịch sử trong các commit trước, hacker vẫn có thể xem lại lịch sử commit để lấy mật khẩu. Cách xử lý bắt buộc là phải lập tức đổi (revoke) toàn bộ mật khẩu thật đó, đồng thời dùng công cụ như `git-filter-repo` hoặc BFG Repo-Cleaner để xóa sạch vết tích khỏi toàn bộ lịch sử Git.

---

### Câu 11: Làm thế nào để clone repository này về một máy tính hoàn toàn mới và khởi chạy thành công?
- **Câu trả lời sinh viên:** Dạ, quy trình gồm 4 bước chuẩn xác:
  1. Chạy `git clone https://github.com/DuongVuong05/DTC245200671-booking-tour.git` và chuyển vào thư mục dự án.
  2. Tạo file môi trường: chạy `cp .env.example .env` và điền các mật khẩu bảo mật.
  3. Khởi chạy toàn bộ hệ thống bằng Docker Compose: `docker compose up -d --build`.
  4. Nạp dữ liệu tài khoản quản trị và dữ liệu mẫu nếu cần: `docker compose exec backend npm run seed` và `npm run seed:tours`. Sau đó mở trình duyệt tại `http://localhost:8888`.
- **Bản chất kỹ thuật:** Tính nhất quán (Reproducibility) nhờ đóng gói Container, không phụ thuộc vào việc máy mới đã cài Node hay PostgreSQL hay chưa.
- **File bằng chứng:** `README.md` (Mục 8).
- **Câu hỏi truy vấn sâu:** *Nếu máy mới chưa cài đặt Node.js thì lệnh `npm run seed` có chạy được không?*
- **Câu trả lời tiếp theo:** Dạ chạy được bình thường thưa thầy, vì lệnh em dùng là `docker compose exec backend npm run seed`. Lệnh này thực thi trình quản lý gói `npm` bên trong container `backend` (nơi đã có sẵn môi trường Node 22), hoàn toàn không đòi hỏi máy host phải cài Node.js.

---

### Câu 12: File `.gitattributes` trong dự án của em có tác dụng gì?
- **Câu trả lời sinh viên:** Dạ, file `.gitattributes` dùng để chuẩn hóa ký tự kết thúc dòng (Line Endings) giữa hệ điều hành Windows (`CRLF`) và Linux (`LF`). Khi em code trên Windows, nếu không có file này, các script chạy trong Docker (vốn là nhân Linux) có thể bị lỗi cú pháp `\r: command not found`. File `.gitattributes` giúp ép buộc các file text và shell script giữ nguyên định dạng `LF`.
- **Bản chất kỹ thuật:** Tránh lỗi không tương thích ký tự điều khiển phân dòng ASCII `0x0D 0x0A` (Windows) và `0x0A` (POSIX/Linux).
- **File bằng chứng:** `.gitattributes`.
- **Câu hỏi truy vấn sâu:** *Lệnh Git nào giúp em kiểm tra xem trạng thái nhánh hiện tại có sạch sẽ (clean) hay không?*
- **Câu trả lời tiếp theo:** Dạ, đó là lệnh `git status`. Nếu hiển thị `nothing to commit, working tree clean` thì toàn bộ mã nguồn đang đồng bộ hoàn toàn với commit gần nhất.

---

### Câu 13: Làm thế nào để xem ai là người viết một dòng code cụ thể trong dự án?
- **Câu trả lời sinh viên:** Dạ, em sử dụng lệnh `git blame <đường_dẫn_file>`. Lệnh này sẽ hiển thị từng dòng code kèm mã hash commit, tên tác giả (Author) và thời gian thực hiện dòng code đó.
- **Bản chất kỹ thuật:** Truy vết nguồn gốc thay đổi mã nguồn theo từng dòng (Line-by-line attribution).
- **File bằng chứng:** Chạy thử `git blame nginx/nginx.conf`.
- **Câu hỏi truy vấn sâu:** *Làm thế nào để quay lui (rollback) lại commit trước đó mà không làm mất các file đang sửa?*
- **Câu trả lời tiếp theo:** Dạ, có thể dùng `git reset --soft HEAD~1` để lùi lại 1 commit nhưng vẫn giữ nguyên toàn bộ các thay đổi ở Staging area, hoặc dùng `git stash` để cất tạm các file đang sửa trước khi checkout.

---

### Câu 14: Tại sao thư mục `backend/node_modules` và `frontend/dist` lại phải đưa vào `.gitignore`?
- **Câu trả lời sinh viên:** Dạ, vì `node_modules` chứa hàng nghìn thư viện phụ thuộc có dung lượng hàng trăm Megabyte, và các thư viện này hoàn toàn có thể tái tạo lại bằng lệnh `npm ci` dựa trên file `package-lock.json`. Tương tự, `dist` là sản phẩm đóng gói sau khi chạy `npm run build`. Đưa chúng lên Git sẽ làm phình to dung lượng repository vô ích và gây xung đột khi chạy trên các hệ điều hành khác nhau.
- **Bản chất kỹ thuật:** Nguyên tắc chỉ quản lý mã nguồn gốc (Source code), không quản lý artifact sinh ra tự động (Generated artifacts/dependencies).
- **File bằng chứng:** `backend/.gitignore`, `frontend/.gitignore`.
- **Câu hỏi truy vấn sâu:** *Sự khác nhau giữa `npm install` và `npm ci` trong Dockerfile là gì?*
- **Câu trả lời tiếp theo:** Dạ, `npm install` có thể tự động cập nhật phiên bản thư viện theo dấu mũ `^` trong `package.json`, còn `npm ci` (Clean Install) bắt buộc cài đặt chính xác tuyệt đối các phiên bản ghi trong `package-lock.json`, xóa sạch thư mục cũ trước khi cài, đảm bảo môi trường build luôn đồng nhất 100% và tốc độ chạy nhanh hơn.

---

### Câu 15: README.md trong dự án đóng vai trò gì theo tiêu chuẩn đánh giá môn học?
- **Câu trả lời sinh viên:** Dạ, `README.md` là tài liệu kỹ thuật trung tâm của dự án. Nó cung cấp cho người chấm thi: thông tin sinh viên, mục tiêu đề tài, sơ đồ kiến trúc Mermaid, bảng ánh xạ 10 service/port, bảng giải thích biến môi trường, hướng dẫn các bước cài đặt từ đầu, tài khoản demo, danh mục API, các mốc commit lịch sử, hướng dẫn kịch bản demo và các hạn chế đã biết của hệ thống.
- **Bản chất kỹ thuật:** Đóng vai trò là bản đặc tả kỹ thuật (Technical Specification & Runbook).
- **File bằng chứng:** `README.md`.
- **Câu hỏi truy vấn sâu:** *Trong README em có nêu các hạn chế nào đã biết của hệ thống?*
- **Câu trả lời tiếp theo:** Dạ, em có nêu trung thực 5 hạn chế: hệ thống chạy HTTP cổng 8888 chưa cấu hình HTTPS, chưa có node-exporter/cadvisor đo tải host, tài nguyên video `/vd.mp4` dung lượng khá nặng (~59MB), chưa tích hợp cổng thanh toán trực tuyến MoMo/VNPay (đang xác nhận đơn thủ công), và mật khẩu Gmail SMTP cũ cần được thu hồi tạo mới.

---

### Câu 16: Nếu có 2 sinh viên cùng làm một dự án thì quy trình phối hợp trên Git diễn ra như thế nào?
- **Câu trả lời sinh viên:** Dạ, quy trình chuẩn là sử dụng mô hình Git Flow hoặc GitHub Flow: Nhánh `main` là nhánh ổn định dùng để triển khai; mỗi tính năng mới sẽ được tạo một nhánh riêng (ví dụ `feature/nginx-proxy`, `feature/monitoring`). Khi hoàn thành, lập Pull Request (PR) để thành viên còn lại review code, sau đó mới hợp nhất (merge) vào `main`. Nếu xảy ra xung đột (Merge Conflict), hai người sẽ cùng ngồi phân tích và giải quyết thủ công các đoạn code bị trùng.
- **Bản chất kỹ thuật:** Branching Strategy & Code Review Workflow.
- **Câu hỏi truy vấn sâu:** *Lệnh nào giúp lấy mã nguồn mới nhất từ remote về và gộp vào nhánh hiện tại?*
- **Câu trả lời tiếp theo:** Dạ, đó là lệnh `git pull` (bản chất là sự kết hợp của `git fetch` và `git merge`).

---

## NHÓM 3: DOCKER VÀ DOCKER COMPOSE

### Câu 17: Container khác gì so với Máy ảo (Virtual Machine - VM)?
- **Câu trả lời sinh viên:** Dạ thưa thầy, Máy ảo (như VMware, VirtualBox) ảo hóa ở tầng phần cứng, mỗi VM phải mang theo một hệ điều hành khách (Guest OS) riêng biệt gồm đầy đủ kernel, trình điều khiển, chiếm nhiều dung lượng ổ cứng (hàng chục GB) và khởi động mất vài phút. Còn Container ảo hóa ở tầng hệ điều hành, chia sẻ chung nhân Linux Kernel của máy host thông qua Namespaces và Cgroups, dung lượng cực nhẹ (vài chục MB) và khởi động chỉ mất vài giây.
- **Bản chất kỹ thuật:** OS-level virtualization vs Hardware-level virtualization (Hypervisor Type 2).
- **File bằng chứng:** `docker-compose.yml`.
- **Câu hỏi truy vấn sâu:** *Vậy tại sao Docker lại chạy được trên Windows nếu container chia sẻ nhân Linux?*
- **Câu trả lời tiếp theo:** Dạ, trên Windows, Docker Desktop sử dụng nền tảng máy ảo siêu nhẹ **WSL2 (Windows Subsystem for Linux 2)**. WSL2 cung cấp một nhân Linux thực sự chạy ngầm, và các container Docker chia sẻ chung nhân Linux của WSL2 này.

---

### Câu 18: File `docker-compose.yml` của em gồm những phần chính nào?
- **Câu trả lời sinh viên:** Dạ, file gồm 3 khối gốc chính:
  1. `services:`: Khai báo định nghĩa chi tiết cho 10 dịch vụ container (`postgres`, `pgadmin`, `postgres-exporter`, `backend`, `frontend`, `nginx`, `prometheus`, `grafana`, `loki`, `promtail`).
  2. `volumes:`: Khai báo 3 Named Volumes dùng chung để lưu trữ bền vững (`postgres_data`, `uploads_data`, `loki_data`).
  3. `networks:`: Khai báo 4 mạng ảo độc lập (`frontend-net`, `backend-net`, `db-net`, `monitor-net`).
- **Bản chất kỹ thuật:** Compose File Specification Version 2/3.
- **File bằng chứng:** `docker-compose.yml` (dòng 1, 176, 181).
- **Câu hỏi truy vấn sâu:** *Chính sách `restart: unless-stopped` có ý nghĩa gì? Nó khác gì với `restart: always`?*
- **Câu trả lời tiếp theo:** Dạ, `unless-stopped` có nghĩa là container sẽ tự động khởi động lại nếu bị crash hoặc khi máy tính khởi động lại, **trừ trường hợp** người quản trị đã chủ động ra lệnh dừng nó bằng tay (`docker compose stop`). Còn `always` thì ngay cả khi quản trị viên đã stop thủ công, khi Docker daemon khởi động lại nó vẫn sẽ tự bật lên.

---

### Câu 19: Tại sao trong `docker-compose.yml` em lại chia thành 4 mạng thay vì dùng 1 mạng mặc định?
- **Câu trả lời sinh viên:** Dạ, đây là kỹ thuật **Cô lập mạng (Network Isolation)** nhằm tăng cường bảo mật. Nếu dùng 1 mạng chung, container Nginx ở tầng ngoài có thể nhìn thấy và tấn công trực tiếp vào container PostgreSQL. Khi em chia 4 mạng, Frontend và Nginx không hề nằm trong `db-net`, chỉ có Backend mới được cấp quyền vào `db-net`. Nhờ đó nếu Nginx bị hacker chiếm quyền, chúng cũng không thể kết nối tới cơ sở dữ liệu.
- **Bản chất kỹ thuật:** Phân đoạn mạng (Network Segmentation) và Nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege).
- **File bằng chứng:** `docker-compose.yml` (các khối `networks:` của từng service).
- **Câu hỏi truy vấn sâu:** *Container `backend` nằm trong những mạng nào?*
- **Câu trả lời tiếp theo:** Dạ, `backend` nằm trong 2 mạng: `db-net` để gọi tới cơ sở dữ liệu PostgreSQL, và `backend-net` để nhận request chuyển tiếp từ Nginx và kết nối với Prometheus để xuất metrics.

---

### Câu 20: Làm thế nào chứng minh được Nginx không thể kết nối trực tiếp đến PostgreSQL?
- **Câu trả lời sinh viên:** Dạ, em có thể chứng minh ngay bằng lệnh thực thi từ container Nginx:
  `docker exec booking-nginx ping -c 1 postgres`
  Kết quả trả về là `ping: bad address 'postgres'`. Nginx thậm chí không thể phân giải tên miền của PostgreSQL qua DNS, chứng minh hai container hoàn toàn bị cách ly về mạng.
- **Bản chất kỹ thuật:** Docker Engine DNS Server chỉ trả về bản ghi A (IP Address) của các container cùng tham gia trong ít nhất một mạng chung.
- **File bằng chứng:** Đã kiểm chứng thực tế trong phiên terminal.
- **Câu hỏi truy vấn sâu:** *Nếu em muốn Nginx kết nối được với PostgreSQL thì phải sửa thế nào?*
- **Câu trả lời tiếp theo:** Dạ, em phải vào `docker-compose.yml`, tại service `nginx` thêm mạng `- db-net` vào danh sách networks. Nhưng về mặt an ninh hệ thống thì tuyệt đối không nên làm như vậy.

---

### Câu 21: Multi-stage build trong `frontend/Dockerfile` có tác dụng gì?
- **Câu trả lời sinh viên:** Dạ, Multi-stage build giúp giảm tối đa dung lượng image và tăng tính bảo mật.
  - Giai đoạn 1 (Builder): Sử dụng image `node:22-alpine` đầy đủ công cụ để chạy `npm run build` sinh ra mã tĩnh trong thư mục `/dist`.
  - Giai đoạn 2 (Production): Sử dụng image siêu nhẹ `nginxinc/nginx-unprivileged:alpine`, chỉ copy thư mục `/dist` từ giai đoạn 1 sang thư mục web của Nginx (`/usr/share/nginx/html`). Toàn bộ mã nguồn gốc, trình biên dịch và `node_modules` nặng nề đều bị loại bỏ, giúp image thành phẩm cực kỳ nhỏ gọn (~30MB) và không chứa các công cụ có thể bị hacker khai thác.
- **Bản chất kỹ thuật:** Tách biệt môi trường Build (Build Environment) và môi trường Chạy (Runtime Environment).
- **File bằng chứng:** `frontend/Dockerfile` (dòng 1-13).
- **Câu hỏi truy vấn sâu:** *Lệnh nào trong Dockerfile thể hiện việc copy dữ liệu giữa 2 stage?*
- **Câu trả lời tiếp theo:** Dạ, đó là dòng `COPY --from=builder /app/dist /usr/share/nginx/html`. Cờ `--from=builder` chỉ định lấy dữ liệu từ stage đầu tiên có tên là `builder`.

---

### Câu 22: Phân biệt `docker compose up`, `docker compose stop`, `docker compose down` và `docker compose restart`?
- **Câu trả lời sinh viên:** Dạ:
  - `up`: Tạo và khởi động các container, mạng và volume theo cấu hình.
  - `stop`: Tạm dừng các container đang chạy mà không xóa bỏ container hay mạng.
  - `down`: Dừng và **xóa bỏ hoàn toàn** các container, mạng ảo đã tạo (nhưng vẫn giữ lại dữ liệu trong volume).
  - `restart`: Khởi động lại các container mà không đọc lại cấu hình hay build lại image.
- **Bản chất kỹ thuật:** Quản lý vòng đời (Lifecycle) của tài nguyên container trong Docker Engine.
- **Câu hỏi truy vấn sâu:** *Khi nào thì em cần thêm cờ `--build` vào lệnh `docker compose up`?*
- **Câu trả lời tiếp theo:** Dạ, khi em có sửa đổi mã nguồn trong thư mục `backend/` hoặc `frontend/`, hoặc sửa file `Dockerfile`. Nếu không có `--build`, Docker sẽ sử dụng lại image cũ đã build trước đó và không áp dụng các đoạn code mới sửa.

---

### Câu 23: Làm thế nào để xem mức độ tiêu thụ CPU và RAM của toàn bộ 10 container?
- **Câu trả lời sinh viên:** Dạ, em sử dụng lệnh `docker stats` (hoặc `docker stats --no-stream`). Lệnh này sẽ hiển thị bảng thời gian thực gồm: Tên container, % CPU đang dùng, dung lượng RAM sử dụng trên mức trần, tốc độ I/O mạng và I/O ổ đĩa.
- **Bản chất kỹ thuật:** Đọc dữ liệu trực tiếp từ các tập tin thống kê trong hệ thống file ảo `cgroups` (`/sys/fs/cgroup/`).
- **File bằng chứng:** Chạy thử `docker stats --no-stream`.
- **Câu hỏi truy vấn sâu:** *Nếu một container hiển thị MEM USAGE là `512MiB / 512MiB` thì có nguy cơ gì?*
- **Câu trả lời tiếp theo:** Dạ, container đó đã chạm ngưỡng giới hạn RAM tối đa (Memory Limit) và sắp bị hệ điều hành tiêu diệt bằng tín hiệu `SIGKILL` (OOMKilled). Cần kiểm tra mã nguồn để tìm nguyên nhân rò rỉ bộ nhớ hoặc nâng trần RAM trong compose.

---

### Câu 24: Tại sao trong `backend/Dockerfile` em lại dùng lệnh `npm ci` thay vì `npm install`?
- **Câu trả lời sinh viên:** Dạ, lệnh `npm ci` được thiết kế chuyên biệt cho môi trường tự động hóa (CI/CD và Docker). Nó đọc trực tiếp từ `package-lock.json` để cài đặt phiên bản chính xác 100%, không bao giờ tự ý cập nhật phiên bản, và bỏ qua các bước kiểm tra xung đột thừa thãi, giúp việc build image diễn ra nhanh hơn và đảm bảo môi trường trên máy em và máy thầy là hoàn toàn đồng nhất.
- **Bản chất kỹ thuật:** Deterministic Dependency Resolution.
- **File bằng chứng:** `backend/Dockerfile` (dòng 4), `frontend/Dockerfile` (dòng 4).
- **Câu hỏi truy vấn sâu:** *Nếu không có file `package-lock.json` thì lệnh `npm ci` có chạy được không?*
- **Câu trả lời tiếp theo:** Dạ không, lệnh `npm ci` sẽ báo lỗi ngay lập tức và dừng build nếu thiếu `package-lock.json`.

---

### Câu 25: Bind Mount khác gì với Named Volume trong Docker?
- **Câu trả lời sinh viên:** Dạ:
  - **Bind Mount:** Ánh xạ trực tiếp một file hoặc thư mục cụ thể từ máy host vào bên trong container (ví dụ `./nginx/nginx.conf:/etc/nginx/nginx.conf`). Thường dùng cho các file cấu hình cần sửa nhanh trên máy host.
  - **Named Volume:** Do chính Docker Engine quản lý trong vùng lưu trữ riêng của Docker (thường nằm tại `/var/lib/docker/volumes/`). Người dùng không cần quan tâm đường dẫn vật lý trên host, hiệu năng I/O cao hơn và dễ dàng sao lưu, di chuyển giữa các container (ví dụ `postgres_data`).
- **Bản chất kỹ thuật:** Storage Driver & Mount Namespace.
- **File bằng chứng:** `docker-compose.yml` (so sánh dòng 118 bind mount và dòng 13 named volume).
- **Câu hỏi truy vấn sâu:** *Trong dự án, những tài nguyên nào dùng Bind Mount và những tài nguyên nào dùng Named Volume?*
- **Câu trả lời tiếp theo:** Dạ, các file cấu hình dùng Bind Mount gồm: `nginx.conf`, `init.sql`, `prometheus.yml`, `loki-config.yml`, `promtail-config.yml`, và thư mục provisioning của Grafana. Còn dữ liệu bền vững dùng Named Volume gồm: `postgres_data`, `uploads_data`, và `loki_data`.

---

### Câu 26: Tại sao container `booking-nginx` trong lệnh `docker compose ps` lại hiển thị trạng thái `(unhealthy)`?
- **Câu trả lời sinh viên:** Dạ thưa thầy, đây là một điểm rất đặc biệt về mặt kỹ thuật! Trong `docker-compose.yml`, câu lệnh healthcheck của Nginx là `wget http://localhost:8080/`. Trên image Alpine Linux, lệnh `wget` mặc định phân giải chữ `localhost` ra địa chỉ IPv6 là `[::1]`. Tuy nhiên, trong file `nginx.conf`, cấu hình chỉ mở cổng IPv4 qua dòng lệnh `listen 8080;` chứ không mở IPv6 (`listen [::]:8080;`). Khi wget kết nối vào `[::1]:8080` bị từ chối kết nối, khiến Docker đánh dấu container là unhealthy. Nhưng trên thực tế, khi em chạy kiểm tra bằng IPv4 `wget http://127.0.0.1:8080/` thì thành công rực rỡ và Nginx vẫn phục vụ website cổng 8888 hoàn toàn bình thường 100%!
- **Bản chất kỹ thuật:** Sự không tương thích giữa IPv6 resolver của BusyBox wget và IPv4-only socket binding của Nginx daemon.
- **File bằng chứng:** `docker-compose.yml` (dòng 107), `nginx/nginx.conf` (dòng 6), kết quả lệnh `docker inspect booking-nginx`.
- **Câu hỏi truy vấn sâu:** *Làm thế nào để sửa triệt để lỗi này để container chuyển sang màu xanh `(healthy)`?*
- **Câu trả lời tiếp theo:** Dạ, có 2 cách sửa: Cách 1 là đổi lệnh test trong healthcheck thành `http://127.0.0.1:8080/`. Cách 2 là trong `nginx.conf` thêm dòng `listen [::]:8080;` để Nginx lắng nghe cả giao thức IPv6.

---

### Câu 27: Cờ `-d` trong lệnh `docker compose up -d` có ý nghĩa gì?
- **Câu trả lời sinh viên:** Dạ, cờ `-d` viết tắt của **Detached Mode** (Chế độ chạy ngầm). Nó giúp các container khởi chạy dưới dạng tiến trình nền (Background process) và trả lại quyền điều khiển dòng lệnh Terminal cho người dùng tiếp tục thao tác, thay vì in toàn bộ log ra màn hình và chiếm giữ cửa sổ terminal.
- **Bản chất kỹ thuật:** Fork process và giải phóng standard input/output (TTY) của phiên làm việc.
- **Câu hỏi truy vấn sâu:** *Nếu không dùng `-d`, khi em ấn tổ hợp phím `Ctrl + C` thì chuyện gì xảy ra?*
- **Câu trả lời tiếp theo:** Dạ, Docker sẽ gửi tín hiệu `SIGINT` tới toàn bộ các container đang chạy và tiến hành dừng (stop) toàn bộ hệ thống lại.

---

### Câu 28: Làm thế nào để xem log trực tiếp của riêng một container (ví dụ backend) đang chạy ngầm?
- **Câu trả lời sinh viên:** Dạ, em sử dụng lệnh:
  `docker compose logs -f backend`
  Cờ `-f` viết tắt của `follow` (tương tự `tail -f` trong Linux), giúp theo dõi liên tục các dòng log mới phát sinh theo thời gian thực.
- **Bản chất kỹ thuật:** Stream luồng stdout và stderr của container qua Docker Logging Driver.
- **Câu hỏi truy vấn sâu:** *Làm sao để chỉ xem 50 dòng log gần nhất?*
- **Câu trả lời tiếp theo:** Dạ, em thêm cờ `--tail 50`, lệnh sẽ là: `docker compose logs --tail 50 backend`.

---

## NHÓM 4: POSTGRESQL VÀ PGADMIN 4

### Câu 29: Cơ sở dữ liệu của em có bao nhiêu bảng? Hãy kể tên các bảng chính và mối quan hệ giữa chúng?
- **Câu trả lời sinh viên:** Dạ, cơ sở dữ liệu `booking_tour` gồm đúng 9 bảng: `tours`, `tour_schedules`, `customers`, `bookings`, `promotions`, `vehicles`, `guides`, `users`, và `explore_items`. Mối quan hệ chính: Một Tour có nhiều Lịch trình khởi hành (`tour_schedules`). Một Lịch trình được phân công một Phương tiện xe (`vehicles`). Khách hàng (`customers`) đặt một Lịch trình cụ thể sẽ tạo ra một Đơn đặt tour (`bookings`), đơn này có thể áp dụng một Mã giảm giá (`promotions`).
- **Bản chất kỹ thuật:** Relational Database Schema với quan hệ 1-Nhiều và các ràng buộc toàn vẹn khóa ngoại.
- **File bằng chứng:** `database/init.sql`, kết quả kiểm tra `psql -c "\dt"`.
- **Câu hỏi truy vấn sâu:** *Khóa ngoại giữa `bookings` và `tour_schedules` có hành vi xóa (ON DELETE) là gì?*
- **Câu trả lời tiếp theo:** Dạ, trong file `init.sql` dòng 111, em cấu hình là `ON DELETE CASCADE`. Nghĩa là nếu một lịch trình tour bị xóa thì các đơn đặt tour thuộc lịch trình đó cũng sẽ tự động bị xóa theo để tránh dữ liệu mồ côi (Orphan records). Còn với `promotion_id` thì em để `ON DELETE SET NULL` để nếu xóa mã giảm giá thì đơn hàng vẫn giữ nguyên giá trị đã đặt.

---

### Câu 30: Em đã giải quyết bài toán Chống bán quá số chỗ (Overbooking) và Race Condition như thế nào?
- **Câu trả lời sinh viên:** Dạ, đây là phần logic phức tạp nhất trong file `bookingController.js`. Khi nhận request đặt tour, em mở một Database Transaction bằng `BEGIN`. Sau đó em thực hiện truy vấn khóa dòng bi quan:
  `SELECT available_seats FROM tour_schedules WHERE id = $1 FOR UPDATE`
  Khóa `FOR UPDATE` buộc các request khác muốn đặt cùng lịch trình này phải xếp hàng chờ. Hệ thống kiểm tra: nếu số chỗ còn lại nhỏ hơn số khách yêu cầu thì em lập tức `ROLLBACK` và báo lỗi hết chỗ. Nếu đủ chỗ, hệ thống trừ số ghế trong `tour_schedules`, chèn bản ghi vào `bookings`, rồi mới gọi `COMMIT`. Nhờ vậy không bao giờ xảy ra tình trạng 2 người cùng đặt 1 chỗ cuối cùng.
- **Bản chất kỹ thuật:** Pessimistic Concurrency Control (Khóa bi quan mức dòng) kết hợp ACID Transactions.
- **File bằng chứng:** `backend/src/controllers/bookingController.js` (dòng 50-178).
- **Câu hỏi truy vấn sâu:** *Ngoài kiểm tra bằng code ở Backend, trong database em có ràng buộc nào để bảo vệ không bị số ghế âm không?*
- **Câu trả lời tiếp theo:** Dạ có thưa thầy! Trong `database/init.sql` dòng 200, em đã tạo một ràng buộc kiểm tra cấp database:
  `ALTER TABLE tour_schedules ADD CONSTRAINT chk_seats CHECK (available_seats >= 0);`
  Nhờ ràng buộc này, ngay cả khi code backend bị lỗi logic thì PostgreSQL cũng sẽ từ chối lệnh UPDATE và không bao giờ cho phép số ghế bị âm.

---

### Câu 31: Khách hàng hủy tour thì số chỗ ngồi được xử lý như thế nào?
- **Câu trả lời sinh viên:** Dạ, trong hàm `updateBookingStatus` (Admin hủy) và `cancelBooking` (Khách tự hủy đơn Pending), khi trạng thái đơn chuyển sang `Cancelled`, hệ thống tự động cộng hoàn trả lại số người của đơn đó vào cột `available_seats` của lịch trình:
  `UPDATE tour_schedules SET available_seats = available_seats + $1 WHERE id = $2`
  Ngược lại, nếu Admin đổi trạng thái từ `Cancelled` về lại trạng thái khác, hệ thống sẽ kiểm tra xem lịch trình còn đủ chỗ không rồi mới trừ lại ghế.
- **Bản chất kỹ thuật:** State-driven Resource Reallocation trong Transaction.
- **File bằng chứng:** `backend/src/controllers/bookingController.js` (dòng 242-264 và dòng 423-427).
- **Câu hỏi truy vấn sâu:** *Khách hàng có thể tự hủy đơn khi đơn đã ở trạng thái `Confirmed` (Đã thanh toán) không?*
- **Câu trả lời tiếp theo:** Dạ không, ở dòng 417 của controller, em chặn rõ: khách hàng chỉ được phép tự hủy khi đơn đang ở trạng thái `Pending` (Chờ xử lý). Nếu đơn đã `Confirmed`, khách phải liên hệ nhân viên chăm sóc khách hàng để xử lý theo quy định hoàn tiền.

---

### Câu 32: Làm thế nào để kết nối pgAdmin vào PostgreSQL trong dự án này?
- **Câu trả lời sinh viên:** Dạ, em truy cập trình duyệt `http://localhost:5050`, đăng nhập bằng email `admin@gmail.com` và mật khẩu trong file `.env`. Trong giao diện pgAdmin, em tạo Server mới: tại ô **Host name/address** em điền là `postgres` (tên service trong Docker network), Port là `5432`, Username là `booking_admin`, và điền mật khẩu DB.
- **Bản chất kỹ thuật:** Giao tiếp qua mạng nội bộ Docker `db-net` nhờ cơ chế Service Discovery.
- **File bằng chứng:** `docker-compose.yml` (service `pgadmin` và `postgres`).
- **Câu hỏi truy vấn sâu:** *Nếu tại ô Host em điền là `localhost` thì có kết nối được không? Tại sao?*
- **Câu trả lời tiếp theo:** Dạ chắc chắn sẽ báo lỗi `Connection refused`! Vì pgAdmin đang chạy bên trong container riêng, nếu điền `localhost` nó sẽ tìm kiếm PostgreSQL ngay trong container pgAdmin (nơi không có PostgreSQL). Bắt buộc phải điền tên service `postgres` để DNS của Docker định tuyến sang container database.

---

### Câu 33: Script `database/init.sql` được thực thi vào thời điểm nào?
- **Câu trả lời sinh viên:** Dạ, script `init.sql` chỉ được thực thi **duy nhất một lần** khi container `postgres` khởi động lần đầu tiên và thư mục dữ liệu `/var/lib/postgresql/data` đang hoàn toàn trống rỗng. Image chính thức của PostgreSQL được lập trình sẵn để quét thư mục `/docker-entrypoint-initdb.d/` và chạy toàn bộ các file `.sql` tìm thấy trong đó.
- **Bản chất kỹ thuật:** Entrypoint initialization hook của Docker Official Image.
- **File bằng chứng:** `docker-compose.yml` (dòng 14: `./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro`).
- **Câu hỏi truy vấn sâu:** *Nếu em sửa file `init.sql` (ví dụ thêm 1 bảng mới) rồi chạy `docker compose restart postgres` thì bảng mới có được tạo không?*
- **Câu trả lời tiếp theo:** Dạ không thưa thầy! Vì volume `postgres_data` đã có sẵn dữ liệu từ lần chạy trước, PostgreSQL sẽ bỏ qua thư mục `initdb.d`. Muốn chạy lại `init.sql`, em phải chạy migration bằng tay hoặc xóa volume cũ đi bằng `docker compose down -v` (chỉ làm khi chấp nhận xóa toàn bộ dữ liệu).

---

### Câu 34: Tại sao trong `init.sql` em lại dùng lệnh `CURRENT_DATE + 7` thay vì điền ngày cố định (ví dụ 2026-10-20)?
- **Câu trả lời sinh viên:** Dạ, đây là kỹ thuật em dùng để dữ liệu demo luôn luôn tươi mới! Trong nghiệp vụ booking, hệ thống tự động chặn khách đặt những tour có ngày khởi hành trong quá khứ. Nếu em điền ngày cố định, sau vài tuần hoặc khi thầy chấm thi ở thời điểm khác, ngày đó sẽ trở thành ngày quá khứ và không thể demo đặt tour được nữa. Dùng `CURRENT_DATE + 7` giúp lịch khởi hành luôn tự động nằm ở 7 ngày trong tương lai tính từ ngày khởi động database!
- **Bản chất kỹ thuật:** Dynamic Relative Seeding.
- **File bằng chứng:** `database/init.sql` (dòng 171-180).
- **Câu hỏi truy vấn sâu:** *Đoạn mã nào trong Backend thực hiện việc chặn đặt tour đã qua ngày khởi hành?*
- **Câu trả lời tiếp theo:** Dạ, tại file `backend/src/controllers/bookingController.js` dòng 96-103, hệ thống so sánh `depDate < todayStart`, nếu ngày khởi hành nhỏ hơn ngày hôm nay thì rollback ngay lập tức và trả lỗi `400: Lịch trình này đã khởi hành`.

---

### Câu 35: Lệnh nào giúp em đăng nhập trực tiếp vào dòng lệnh của PostgreSQL bên trong container?
- **Câu trả lời sinh viên:** Dạ, em sử dụng lệnh:
  `docker exec -it booking-postgres psql -U booking_admin -d booking_tour`
  Sau đó em có thể gõ các lệnh SQL trực tiếp như `SELECT * FROM tours;` hoặc `\dt` để xem bảng.
- **Bản chất kỹ thuật:** Thực thi tiến trình Interactive Terminal (`-it`) với tiện ích CLI `psql`.
- **Câu hỏi truy vấn sâu:** *Làm thế nào để sao lưu (backup) cơ sở dữ liệu `booking_tour` ra một file `.sql` trên máy host?*
- **Câu trả lời tiếp theo:** Dạ, em dùng lệnh tiện ích `pg_dump`:
  `docker exec booking-postgres pg_dump -U booking_admin booking_tour > backup.sql`.

---

### Câu 36: Chỉ mục (Index) trong cơ sở dữ liệu là gì? Em đã tạo những Index nào?
- **Câu trả lời sinh viên:** Dạ, Index là cấu trúc dữ liệu (thường là B-Tree) được tạo riêng cho một hoặc nhiều cột, giúp tăng tốc độ tìm kiếm bản ghi từ độ phức tạp $O(N)$ (quét toàn bảng - Seq Scan) xuống còn $O(\log N)$ (Index Scan). Trong file `init.sql` (dòng 206-212), em đã tạo các Index:
  - `idx_tours_is_featured`: Tăng tốc độ lọc các tour nổi bật cho Trang chủ.
  - `idx_tours_destination`: Tăng tốc độ tìm kiếm tour theo địa điểm du lịch.
  - `idx_tour_schedules_dates`: Tăng tốc độ tra cứu lịch theo khoảng ngày đi - ngày về.
  - `idx_customers_phone` và `idx_customers_email`: Tăng tốc độ tra cứu đơn hàng công khai theo số điện thoại.
- **Bản chất kỹ thuật:** B-Tree Index Optimization for High-frequency Query Filters.
- **File bằng chứng:** `database/init.sql` (dòng 206-212).
- **Câu hỏi truy vấn sâu:** *Tạo quá nhiều Index trên một bảng có gây tác hại gì không?*
- **Câu trả lời tiếp theo:** Dạ có, Index giúp tăng tốc lệnh đọc (`SELECT`) nhưng lại làm chậm các lệnh ghi (`INSERT, UPDATE, DELETE`) vì mỗi khi dữ liệu thay đổi, hệ thống phải cập nhật lại cây chỉ mục B-Tree, đồng thời tốn thêm dung lượng lưu trữ trên ổ đĩa. Do đó chỉ nên đánh Index trên các cột thường xuyên nằm trong mệnh đề `WHERE` hoặc `JOIN`.

---

### Câu 37: Connection Pool trong Node.js hoạt động như thế nào và tại sao cần nó?
- **Câu trả lời sinh viên:** Dạ, nếu mỗi request API đều tạo một kết nối mới tới PostgreSQL rồi đóng lại, máy chủ sẽ bị nghẽn do chi phí bắt tay TCP và xác thực mật khẩu quá tốn thời gian. Connection Pool tạo sẵn một tập hợp các kết nối (ví dụ 10 kết nối). Khi có request gọi vào, ứng dụng mượn một kết nối rảnh rỗi từ Pool để truy vấn (`pool.query`), sau khi xong kết nối sẽ tự động trả về Pool để request khác tái sử dụng.
- **Bản chất kỹ thuật:** Resource Pooling Pattern (Thư viện `pg.Pool`).
- **File bằng chứng:** `backend/src/db.js`.
- **Câu hỏi truy vấn sâu:** *Nếu có 100 request đồng thời nhưng Pool chỉ có 10 kết nối thì 90 request còn lại sẽ thế nào?*
- **Câu trả lời tiếp theo:** Dạ, 90 request còn lại sẽ được đưa vào một hàng đợi (Queue) trong bộ nhớ của Node.js để chờ các kết nối trước giải phóng. Nếu hết thời gian chờ (`connectionTimeoutMillis`) mà vẫn chưa có kết nối thì request mới bị lỗi quá thời gian chờ (Timeout).

---

### Câu 38: Mật khẩu người dùng trong bảng `users` và `customers` được lưu trữ như thế nào?
- **Câu trả lời sinh viên:** Dạ, mật khẩu tuyệt đối không bao giờ được lưu dưới dạng văn bản thô (Plaintext). Hệ thống sử dụng thuật toán băm một chiều **bcrypt** (qua thư viện `bcryptjs`) với Salt ngẫu nhiên để sinh ra chuỗi mã hóa dài 60 ký tự (`password_hash`). Khi người dùng đăng nhập, hệ thống dùng hàm `bcrypt.compare()` để so khớp mật khẩu người dùng nhập với chuỗi băm trong database.
- **Bản chất kỹ thuật:** Cryptographic Hash Function with Adaptive Work Factor & Salting.
- **File bằng chứng:** `backend/src/controllers/authController.js`.
- **Câu hỏi truy vấn sâu:** *Salt trong bcrypt có tác dụng gì?*
- **Câu trả lời tiếp theo:** Dạ, Salt là một chuỗi ngẫu nhiên được tự động thêm vào trước mật khẩu trước khi băm. Nhờ có Salt, hai người dùng có cùng một mật khẩu giống hệt nhau (ví dụ `123456`) sẽ sinh ra hai chuỗi băm hoàn toàn khác nhau, vô hiệu hóa hoàn toàn phương pháp tấn công bằng bảng cầu vồng (Rainbow Table Attack).

---

## NHÓM 5: NGINX VÀ REVERSE PROXY

### Câu 39: Reverse Proxy là gì? Tại sao gọi Nginx là Reverse Proxy?
- **Câu trả lời sinh viên:** Dạ, Proxy thông thường (Forward Proxy) đứng về phía người dùng để đại diện cho người dùng đi ra Internet. Còn **Reverse Proxy** đứng về phía máy chủ, làm cổng đón tiếp toàn bộ người dùng từ Internet và phân phối các yêu cầu ngầm vào các cụm máy chủ nội bộ phía sau. Nginx được gọi là Reverse Proxy vì nó nhận request tại cổng 8888 và chuyển tiếp về các service nội bộ `backend:3000` và `frontend:8080`.
- **Bản chất kỹ thuật:** Gateway Proxying, Layer 7 Application Routing.
- **File bằng chứng:** `nginx/nginx.conf`.
- **Câu hỏi truy vấn sâu:** *Nginx xử lý đồng thời hàng nghìn kết nối bằng kiến trúc nào mà nhanh hơn Apache truyền thống?*
- **Câu trả lời tiếp theo:** Dạ, Apache truyền thống sử dụng mô hình đa tiến trình/đa luồng (Process-driven/Thread-driven), mỗi kết nối tốn 1 luồng riêng gây nghẽn RAM. Còn Nginx sử dụng kiến trúc **Bất đồng bộ hướng sự kiện (Asynchronous Event-driven Architecture)** với cơ chế Non-blocking I/O (dùng `epoll` trên Linux). Một tiến trình Worker của Nginx có thể xử lý hàng chục nghìn kết nối đồng thời với lượng RAM cực kỳ thấp.

---

### Câu 40: Em hãy giải thích từng dòng cấu hình trong file `nginx/nginx.conf` của dự án?
- **Câu trả lời sinh viên:** Dạ:
  - `pid /tmp/nginx.pid;`: Chỉ định ghi mã tiến trình PID vào `/tmp`, bắt buộc khi chạy non-root vì không có quyền ghi vào `/var/run`.
  - `listen 8080;`: Lắng nghe cổng 8080 nội bộ.
  - Các dòng `add_header`: Gắn các tiêu đề bảo mật CSP, X-Frame-Options, X-Content-Type-Options...
  - `location /`: Định tuyến toàn bộ yêu cầu giao diện sang `http://frontend:8080`.
  - `location /api/`: Định tuyến các yêu cầu gọi API sang `http://backend:3000`.
  - `location /uploads/`: Định tuyến yêu cầu xem ảnh tĩnh sang `http://backend:3000`.
  - Các header `proxy_set_header Host $host`, `X-Real-IP $remote_addr`: Giữ nguyên thông tin IP thật của máy client gửi sang backend.
- **Bản chất kỹ thuật:** Cấu hình Directives trong Nginx HTTP Core Module và Proxy Module.
- **File bằng chứng:** `nginx/nginx.conf`.
- **Câu hỏi truy vấn sâu:** *Nếu em đổi thứ tự: đặt `location /api/` nằm bên dưới `location /` thì Nginx có hoạt động đúng không?*
- **Câu trả lời tiếp theo:** Dạ vẫn hoạt động đúng thưa thầy! Vì trong Nginx, quy tắc đối sánh tiền tố (Prefix matching) luôn ưu tiên vị trí khớp dài nhất và cụ thể nhất (Longest prefix match). Đường dẫn `/api/` có độ dài 5 ký tự sẽ luôn được ưu tiên hơn tiền tố `/` chỉ có 1 ký tự, bất kể thứ tự khai báo trong file.

---

### Câu 41: Tại sao Nginx lại lắng nghe cổng 8080 mà không phải cổng 80 chuẩn của HTTP?
- **Câu trả lời sinh viên:** Dạ, vì container Nginx của em sử dụng image `nginxinc/nginx-unprivileged:alpine`. Image này chạy dưới người dùng `nginx` (UID 101), không phải root. Trong hệ điều hành Linux, các cổng mạng có số hiệu nhỏ hơn 1024 (như cổng 80, 443, 22) được coi là các cổng đặc quyền (Privileged Ports), chỉ có người dùng `root` mới được phép mở. Do đó Nginx phải lắng nghe ở cổng không đặc quyền `8080`, và Docker Compose sẽ ánh xạ cổng `8888` của máy host vào cổng `8080` này.
- **Bản chất kỹ thuật:** Linux Kernel Privileged Port Restriction (`CAP_NET_BIND_SERVICE`).
- **File bằng chứng:** `nginx/nginx.conf` (dòng 6), `docker-compose.yml` (dòng 103 và 116).
- **Câu hỏi truy vấn sâu:** *Lệnh nào giúp kiểm tra xem Nginx đang chạy dưới người dùng nào?*
- **Câu trả lời tiếp theo:** Dạ, em chạy `docker exec booking-nginx id`, kết quả trả về là `uid=101(nginx) gid=101(nginx)`.

---

### Câu 42: Directive `proxy_set_header X-Real-IP $remote_addr;` có vai trò quan trọng như thế nào đối với Backend?
- **Câu trả lời sinh viên:** Dạ, khi có Nginx đứng làm trung gian, mọi request chuyển tiếp tới Backend đều xuất phát từ IP nội bộ của container Nginx (dải `172.x.x.x`). Nếu không có dòng này, Backend sẽ tưởng tất cả người dùng trên thế giới đều có chung 1 địa chỉ IP của Nginx. Dòng cấu hình này yêu cầu Nginx ghi địa chỉ IP thật của máy người dùng vào header `X-Real-IP`. Kết hợp với dòng `app.set('trust proxy', 1)` trong Node.js, Backend sẽ đọc được IP thật để thực hiện tính năng **Giới hạn tần suất gọi (Rate Limiting)** chống tấn công DoS và khóa tài khoản khi đăng nhập sai nhiều lần.
- **Bản chất kỹ thuật:** HTTP Reverse Proxy Header Propagation.
- **File bằng chứng:** `nginx/nginx.conf` (dòng 18 và 26), `backend/src/server.js` (dòng 20).
- **Câu hỏi truy vấn sâu:** *Nếu trong `backend/src/server.js` em quên không khai báo `app.set('trust proxy', 1)` thì điều gì xảy ra?*
- **Câu trả lời tiếp theo:** Dạ, thư viện `express-rate-limit` sẽ lấy IP kết nối trực tiếp (là IP của container Nginx). Khi đó chỉ cần 1 người dùng gửi quá 10 request bị khóa thì toàn bộ tất cả người dùng khác trong hệ thống cũng sẽ bị khóa lây theo! Khai báo `trust proxy` là bắt buộc khi chạy sau Reverse Proxy.

---

### Câu 43: Dự án của em đã có HTTPS chưa? Tại sao?
- **Câu trả lời sinh viên:** Dạ thưa thầy, em xin báo cáo trung thực là hệ thống hiện tại **chạy giao thức HTTP thuần ở cổng 8888, chưa cấu hình HTTPS/SSL**. Lý do là vì dự án đang chạy thử nghiệm trên môi trường nội bộ `localhost`, không có tên miền công khai Internet để xin cấp chứng chỉ miễn phí từ Let's Encrypt. Nếu tự tạo chứng chỉ tự ký (Self-signed certificate), trình duyệt sẽ luôn hiện cảnh báo màu đỏ không an toàn. Thay vào đó, em tập trung nguồn lực để hoàn thiện đầy đủ **Bộ 6 Tiêu đề Bảo mật HTTP (Security Headers)** trên Nginx.
- **Bản chất kỹ thuật:** TLS Handshake, Public Key Infrastructure (PKI) và FQDN requirement.
- **File bằng chứng:** `nginx/nginx.conf` (chỉ có `listen 8080;`), `README.md` (Mục 13 và TODO).
- **Câu hỏi truy vấn sâu:** *Nếu đưa lên môi trường sản xuất có tên miền thật thì em sẽ cấu hình HTTPS như thế nào?*
- **Câu trả lời tiếp theo:** Dạ, em sẽ bổ sung một container `certbot` để tự động xin chứng chỉ từ Let's Encrypt. Trong `nginx.conf`, em thêm `listen 8443 ssl;`, khai báo đường dẫn `ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem` và `ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem`, đồng thời mở thêm server block ở cổng 8080 để tự động chuyển hướng (Redirect 301) sang HTTPS.

---

### Câu 44: Em hãy giải thích ý nghĩa của tiêu đề `Content-Security-Policy (CSP)` trong file cấu hình Nginx?
- **Câu trả lời sinh viên:** Dạ, trong `nginx.conf` dòng 12 em cấu hình:
  `Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none';" always;`
  Tiêu đề này kiểm soát các nguồn tài nguyên mà trình duyệt được phép tải và thực thi. Đặc biệt, chỉ thị `frame-ancestors 'none'` nghiêm cấm tuyệt đối mọi website khác trên thế giới nhúng trang web của em vào thẻ `<iframe>`, triệt tiêu hoàn toàn nguy cơ tấn công **Clickjacking** (lừa người dùng click vào các nút ẩn).
- **Bản chất kỹ thuật:** Trình duyệt thực thi chính sách bảo vệ tài nguyên CSP (W3C Standard).
- **File bằng chứng:** `nginx/nginx.conf` (dòng 12).
- **Câu hỏi truy vấn sâu:** *Tiêu đề `X-Frame-Options: SAMEORIGIN` và `frame-ancestors 'none'` trong CSP có gì khác nhau?*
- **Câu trả lời tiếp theo:** Dạ, `X-Frame-Options` là tiêu đề chuẩn cũ, chỉ cho phép cấu hình đơn giản (`DENY` hoặc `SAMEORIGIN`). Còn `frame-ancestors` là tiêu đề thuộc chuẩn CSP hiện đại, có độ ưu tiên cao hơn và cho phép định nghĩa chi tiết danh sách tên miền được phép nhúng. Việc em cấu hình cả hai tiêu đề giúp website được bảo vệ trên cả trình duyệt đời cũ lẫn trình duyệt hiện đại.

---

### Câu 45: Làm thế nào chứng minh bằng dòng lệnh rằng một request đang thực sự đi qua Nginx?
- **Câu trả lời sinh viên:** Dạ, em sử dụng lệnh `curl` với cờ `-I` (chỉ lấy phần Header phản hồi):
  `curl.exe -I http://localhost:8888/`
  Trong kết quả trả về sẽ hiển thị rõ ràng dòng:
  `Server: nginx/1.31.6`
  kèm theo toàn bộ 6 tiêu đề bảo mật do Nginx gắn thêm như `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`. Điều này chứng minh 100% request đã đi qua Nginx.
- **Bản chất kỹ thuật:** HTTP Response Header Inspection.
- **File bằng chứng:** Kết quả chạy thực tế của lệnh `curl.exe -I http://localhost:8888/`.
- **Câu hỏi truy vấn sâu:** *Trong môi trường bảo mật cao, người ta có nên để lộ phiên bản `nginx/1.31.6` ra ngoài không?*
- **Câu trả lời tiếp theo:** Dạ không nên thưa thầy! Để lộ phiên bản cụ thể giúp hacker biết chính xác các lỗ hổng đã được công bố của phiên bản đó để tấn công. Để ẩn đi, em sẽ thêm chỉ thị `server_tokens off;` vào khối `http {}` của file `nginx.conf`. Khi đó header `Server` sẽ chỉ hiện chữ `nginx` đơn thuần.

---

### Câu 46: Directive `try_files $uri $uri/ /index.html;` trong `frontend/nginx.conf` có tác dụng gì?
- **Câu trả lời sinh viên:** Dạ, đây là cấu hình sống còn cho các ứng dụng Single Page Application (SPA) như React Router. Khi người dùng truy cập trực tiếp vào các đường dẫn con như `http://localhost:8888/tours` hoặc bấm F5 tải lại trang, trên ổ cứng server thực chất không có file nào tên là `tours.html`. Chỉ thị `try_files` sẽ kiểm tra: nếu không tìm thấy file `$uri`, nó sẽ tự động trả về file gốc `/index.html`. Trình duyệt tải `index.html` lên và React Router sẽ đọc URL để hiển thị đúng component mà không bị lỗi 404 Not Found.
- **Bản chất kỹ thuật:** URL Rewriting & Client-side Routing Fallback.
- **File bằng chứng:** `frontend/nginx.conf` (dòng 9).
- **Câu hỏi truy vấn sâu:** *Nếu bỏ dòng `try_files` này đi thì chuyện gì sẽ xảy ra khi người dùng ấn F5 tại trang `/admin/dashboard`?*
- **Câu trả lời tiếp theo:** Dạ, Nginx sẽ lập tức trả về trang trắng với mã lỗi `404 Not Found` của Nginx, vì nó tìm trong thư mục `/usr/share/nginx/html/admin/dashboard` không thấy file nào tồn tại.

---

### Câu 47: Nếu Nginx trả về lỗi `502 Bad Gateway`, nguyên nhân là do đâu và quy trình khắc phục ra sao?
- **Câu trả lời sinh viên:** Dạ, mã lỗi 502 Bad Gateway có nghĩa là Nginx (đóng vai trò là Gateway) đã cố gắng kết nối tới máy chủ backend nội bộ phía sau nhưng không nhận được phản hồi (kết nối bị từ chối hoặc timeout).
  Quy trình kiểm tra 3 bước của em:
  1. Chạy `docker compose ps` để xem container `booking-backend` có đang bị tắt (Exited) hoặc liên tục restart không.
  2. Chạy `docker compose logs backend` để đọc log lỗi của Node.js (ví dụ sập do thiếu biến môi trường trong `.env` hoặc sai mật khẩu database).
  3. Kiểm tra xem mạng `backend-net` giữa Nginx và Backend có bị gián đoạn hay không.
- **Bản chất kỹ thuật:** Upstream connection failure at Layer 7.
- **Câu hỏi truy vấn sâu:** *Lỗi 504 Gateway Timeout khác gì với 502 Bad Gateway?*
- **Câu trả lời tiếp theo:** Dạ, 502 là kết nối tới backend thất bại ngay từ đầu (bị từ chối kết nối). Còn 504 là Nginx đã kết nối thành công tới backend, nhưng backend xử lý quá lâu vượt quá thời gian chờ cấu hình trong Nginx (`proxy_read_timeout`, mặc định 60s) mà chưa trả về dữ liệu.

---

### Câu 48: Làm thế nào để cấu hình giới hạn kích thước file upload trong Nginx?
- **Câu trả lời sinh viên:** Dạ, mặc định Nginx giới hạn dung lượng body của request là 1MB. Nếu người dùng tải ảnh tour dung lượng 3MB, Nginx sẽ chặn ngay lập tức với mã lỗi `413 Request Entity Too Large`. Để cho phép tải ảnh lên tới 10MB, em sẽ thêm chỉ thị `client_max_body_size 10M;` vào trong khối `server {}` hoặc `location /uploads/` của file `nginx.conf`.
- **Bản chất kỹ thuật:** Nginx Client Request Body Buffering & Size Enforcement.
- **Câu hỏi truy vấn sâu:** *Ngoài Nginx, ở Backend em có giới hạn kích thước upload không?*
- **Câu trả lời tiếp theo:** Dạ có, trong file `backend/src/routes/uploadRoutes.js` dòng 37, em dùng thư viện Multer với cấu hình `limits: { fileSize: 5 * 1024 * 1024 }` (chặn cứng tối đa 5MB). Cả Nginx và Backend đều phải kiểm tra để bảo vệ server không bị cạn kiệt dung lượng ổ đĩa.

---

## NHÓM 6: PROMETHEUS VÀ GRAFANA MONITORING

### Câu 49: Prometheus thu thập dữ liệu bằng cơ chế Push hay Pull? Cơ chế này có ưu điểm gì?
- **Câu trả lời sinh viên:** Dạ, Prometheus thu thập dữ liệu hoàn toàn bằng cơ chế **Kéo (Pull-based)**. Cứ định kỳ 15 giây, Prometheus sẽ chủ động gửi yêu cầu HTTP GET tới endpoint `/metrics` của từng mục tiêu (Target). Ưu điểm lớn của mô hình Pull là:
  1. Prometheus hoàn toàn chủ động kiểm soát tần suất scrape, không lo bị quá tải nếu các service đồng loạt gửi dữ liệu về như mô hình Push.
  2. Tự động phát hiện được mục tiêu bị chết: nếu Prometheus gửi request mà không nhận được phản hồi, nó sẽ đánh dấu ngay trạng thái target là `DOWN`.
  3. Dễ dàng kiểm tra và debug: lập trình viên chỉ cần mở trình duyệt gõ `http://localhost:3000/metrics` là tự xem được dữ liệu mà không cần thông qua Prometheus.
- **Bản chất kỹ thuật:** Pull-based Metric Aggregation over HTTP/OpenMetrics.
- **File bằng chứng:** `prometheus/prometheus.yml` (dòng 1-16).
- **Câu hỏi truy vấn sâu:** *Vậy trong trường hợp nào thì Prometheus bắt buộc phải dùng cơ chế Push?*
- **Câu trả lời tiếp theo:** Dạ, đó là các tác vụ chạy theo lịch trình ngắn hạn (Batch jobs hoặc Cron jobs). Những tác vụ này chỉ sống trong vài giây rồi biến mất nên Prometheus không kịp kéo dữ liệu. Khi đó người ta sử dụng công cụ trung gian là **Prometheus Pushgateway** để ứng dụng đẩy metrics vào, rồi Prometheus sẽ pull từ Pushgateway sau.

---

### Câu 50: Bốn loại dữ liệu đo lường (Metric Types) cơ bản trong Prometheus là gì? Ứng dụng trong dự án của em như thế nào?
- **Câu trả lời sinh viên:** Dạ, gồm 4 loại:
  1. **Counter:** Số chỉ tăng hoặc reset về 0 khi khởi động lại. Trong dự án: `http_requests_total` đếm tổng số request gọi vào API.
  2. **Gauge:** Con số có thể tăng lên hoặc giảm xuống theo thời gian thực. Trong dự án: `pg_stat_database_numbackends` đo số lượng kết nối đang mở vào database, hoặc dung lượng DB `pg_database_size_bytes`.
  3. **Histogram:** Đo lường sự phân bổ dữ liệu vào các khoảng (buckets) và tính tổng, thường dùng đo độ trễ request.
  4. **Summary:** Tương tự Histogram nhưng tính toán trực tiếp các phân vị (Quantiles như p50, p90, p99) phía client.
- **Bản chất kỹ thuật:** OpenMetrics Core Data Types.
- **File bằng chứng:** `backend/src/server.js` (dòng 12-17 khai báo Counter).
- **Câu hỏi truy vấn sâu:** *Tại sao để tính số request mỗi giây người ta không vẽ trực tiếp Counter mà phải dùng hàm `rate()`?*
- **Câu trả lời tiếp theo:** Dạ, vì Counter là số tích lũy tăng dần liên tục, đồ thị của nó sẽ chỉ là một đường dốc đi lên mãi. Hàm `rate(http_requests_total[5m])` lấy đạo hàm mức tăng trong cửa sổ 5 phút chia cho số giây, cho ra tốc độ request tức thời trên từng giây (req/s), giúp nhìn rõ lúc nào hệ thống cao điểm, lúc nào vắng khách.

---

### Câu 51: Exporter là gì? Tại sao cần `postgres-exporter` mà không cần exporter cho Backend Node.js?
- **Câu trả lời sinh viên:** Dạ, **Exporter** là một phần mềm chuyển đổi (Adapter). Nó kết nối vào các dịch vụ phần mềm không hỗ trợ sẵn chuẩn Prometheus (như PostgreSQL, MySQL, Redis), lấy các chỉ số nội bộ của dịch vụ đó và mở ra một trang web `/metrics` chuẩn Prometheus.
  PostgreSQL bản gốc không biết chuẩn Prometheus là gì, nên cần `postgres-exporter` làm thông dịch viên. Còn Backend Node.js là do em tự viết mã nguồn, em đã cài trực tiếp thư viện `prom-client` vào code và tự mở endpoint `/metrics` tại cổng 3000, nên Backend tự bản thân nó đã là một Exporter rồi, không cần phần mềm phụ trợ nào nữa!
- **Bản chất kỹ thuật:** Third-party Metrics Exporter Pattern vs In-app Native Instrumentation.
- **File bằng chứng:** `backend/package.json` (thư viện `prom-client`), `docker-compose.yml` (service `postgres-exporter`).
- **Câu hỏi truy vấn sâu:** *Postgres-exporter kết nối vào database bằng tài khoản nào và lấy những thông tin gì?*
- **Câu trả lời tiếp theo:** Dạ, trong `docker-compose.yml` dòng 43, nó dùng tài khoản `booking_admin` kết nối vào `booking_tour`. Nó truy vấn các view hệ thống như `pg_stat_database` để lấy số transaction commit, số bản ghi chèn mới (INSERT), dung lượng database và số lượng kết nối client.

---

### Câu 52: Trong dự án có những Target nào được Prometheus giám sát và trạng thái hiện tại là gì?
- **Câu trả lời sinh viên:** Dạ, trong file `prometheus/prometheus.yml` cấu hình đúng 3 Target:
  1. `localhost:9090`: Tự giám sát Prometheus.
  2. `backend:3000`: Giám sát ứng dụng Node.js.
  3. `postgres-exporter:9187`: Giám sát cơ sở dữ liệu PostgreSQL.
  Cả 3 target này hiện tại đều đang ở trạng thái **UP (màu xanh)** trên giao diện `http://localhost:9090/targets`.
- **Bản chất kỹ thuật:** Scrape pool targets registration.
- **File bằng chứng:** `prometheus/prometheus.yml`, API `http://localhost:9090/api/v1/targets`.
- **Câu hỏi truy vấn sâu:** *Tại sao Nginx không xuất hiện trong danh sách Targets của Prometheus?*
- **Câu trả lời tiếp theo:** Dạ, vì Nginx bản unprivileged không có sẵn endpoint `/metrics`. Muốn đưa Nginx vào Prometheus cần phải cài thêm module `stub_status` và chạy thêm container `nginx-prometheus-exporter`. Để tối ưu tài nguyên cho đề tài, em đã dùng giải pháp thay thế rất thông minh: dùng **Loki** để đếm số dòng access log của Nginx và vẽ biểu đồ request trên Grafana!

---

### Câu 53: Grafana kết nối với Prometheus bằng cách nào? Cơ chế nạp tự động (Provisioning) diễn ra ra sao?
- **Câu trả lời sinh viên:** Dạ, Grafana kết nối tới Prometheus qua mạng nội bộ `monitor-net` bằng URL `http://prometheus:9090`. Để không phải bấm tay thêm Datasource sau mỗi lần tạo container, em cấu hình tự động trong file `grafana/provisioning/datasources/datasources.yml`. Khi container Grafana khởi động, tiến trình nội bộ sẽ tự động đọc file này và thiết lập Prometheus làm nguồn dữ liệu mặc định (Default Datasource).
- **Bản chất kỹ thuật:** Grafana Declarative Configuration Provisioning.
- **File bằng chứng:** `grafana/provisioning/datasources/datasources.yml`.
- **Câu hỏi truy vấn sâu:** *Nếu Prometheus bị đổi cổng từ 9090 sang 9091 thì em phải sửa ở những file nào?*
- **Câu trả lời tiếp theo:** Dạ, em phải sửa ở 3 file: sửa cổng trong `docker-compose.yml` (service prometheus), sửa URL trong file `grafana/provisioning/datasources/datasources.yml` thành `http://prometheus:9091`, và sửa chính file `prometheus/prometheus.yml` ở target tự giám sát.

---

### Câu 54: Em hãy giải thích câu lệnh PromQL: `sum by (route) (rate(http_requests_total[5m]))`?
- **Câu trả lời sinh viên:** Dạ:
  - `http_requests_total`: Tên biến đếm số request HTTP.
  - `[5m]`: Range Vector, lấy dữ liệu tích lũy trong 5 phút gần nhất.
  - `rate(...)`: Tính tốc độ tăng trưởng trung bình mỗi giây (tính ra request/giây).
  - `sum by (route) (...)`: Gom nhóm và tính tổng theo từng đường dẫn API (`/api/tours`, `/api/bookings`), loại bỏ các nhãn không cần thiết như method hay status.
  Kết quả cho ra biểu đồ trực quan thể hiện rõ từng API đang chịu tải bao nhiêu request/giây.
- **Bản chất kỹ thuật:** PromQL Aggregation & Rate Calculation over Range Vectors.
- **File bằng chứng:** `grafana/dashboards/booking-tour-overview.json` (Panel 1 dòng 24).
- **Câu hỏi truy vấn sâu:** *Hàm `rate()` khác gì với hàm `irate()` trong PromQL?*
- **Câu trả lời tiếp theo:** Dạ, hàm `rate()` tính trung bình trượt trên toàn bộ khoảng thời gian 5 phút nên biểu đồ rất mượt và chống nhiễu tốt. Còn `irate()` (Instant rate) chỉ tính tốc độ dựa trên đúng 2 điểm dữ liệu gần nhất, biểu đồ sẽ giật cục hơn nhưng bắt được các đợt tăng đột biến (spikes) trong tích tắc.

---

### Câu 55: Panel "Event loop lag" trong Dashboard của em đo cái gì và tại sao lại quan trọng với Node.js?
- **Câu trả lời sinh viên:** Dạ, câu lệnh PromQL là `nodejs_eventloop_lag_seconds`. Nó đo độ trễ của vòng lặp sự kiện (Event Loop) trong Node.js. Vì Node.js chạy đơn luồng (Single-threaded), nếu lập trình viên viết code kém (ví dụ dùng vòng lặp for hàng triệu lần đồng bộ hoặc regex phức tạp gây ReDoS), luồng chính sẽ bị khóa cứng (block). Khi đó độ trễ Event loop lag sẽ tăng vọt từ vài mili-giây lên vài giây, toàn bộ các request của khách hàng khác sẽ bị treo cứng. Đây là chỉ số quan trọng hàng đầu để đánh giá sức khỏe của một ứng dụng Node.js.
- **Bản chất kỹ thuật:** Node.js Libuv Event Loop Delay Monitoring.
- **File bằng chứng:** `grafana/dashboards/booking-tour-overview.json` (Panel 3 dòng 62).
- **Câu hỏi truy vấn sâu:** *Độ trễ Event Loop bình thường của ứng dụng là khoảng bao nhiêu?*
- **Câu trả lời tiếp theo:** Dạ, ở trạng thái bình thường độ trễ này chỉ dao động dưới 20 mili-giây (0.02s). Nếu chỉ số này vượt quá 100 mili-giây kéo dài thì hệ thống đang có dấu hiệu quá tải xử lý.

---

### Câu 56: Khi em thực hiện thao tác đặt một tour mới trên website, chỉ số nào trên Dashboard Grafana sẽ thay đổi ngay lập tức?
- **Câu trả lời sinh viên:** Dạ, có ít nhất 4 chỉ số sẽ phản hồi ngay lập tức:
  1. Panel 1: Tốc độ request của route `/api/bookings` sẽ tăng lên.
  2. Panel 4: Số giao dịch `Transactions/s` của PostgreSQL sẽ nhảy lên do có lệnh `COMMIT`.
  3. Panel 7: Tổng số transactions đã commit tăng thêm 1.
  4. Panel 10: Tốc độ `INSERT/s` (`pg_stat_database_tup_inserted`) sẽ tăng vọt vì có một bản ghi mới được chèn vào bảng `bookings`.
- **Bản chất kỹ thuật:** Live Metric Correlation with Business Actions.
- **File bằng chứng:** `grafana/dashboards/booking-tour-overview.json`.
- **Câu hỏi truy vấn sâu:** *Nếu em đặt tour nhưng Panel 10 không tăng thì nguyên nhân có thể do đâu?*
- **Câu trả lời tiếp theo:** Dạ, có thể do đặt tour thất bại (ví dụ hết chỗ hoặc sai voucher) dẫn đến transaction bị `ROLLBACK`. Khi rollback thì không có bản ghi nào được ghi xuống bảng nên chỉ số chèn bản ghi `tup_inserted` sẽ không tăng.

---

### Câu 57: Prometheus lưu trữ dữ liệu ở đâu trong container? Nếu container Prometheus bị restart thì metrics cũ có mất không?
- **Câu trả lời sinh viên:** Dạ, mặc định Prometheus lưu dữ liệu TSDB trong thư mục `/prometheus` bên trong container. Trong file `docker-compose.yml` hiện tại, service `prometheus` chưa gắn Named Volume riêng cho thư mục `/prometheus` (chỉ bind mount file `prometheus.yml`). Do đó, nếu chỉ `restart` container thì dữ liệu metrics vẫn còn trong layer của container; nhưng nếu chạy `docker compose down` rồi tạo lại container mới thì các dữ liệu metrics lịch sử trước đó sẽ bị reset.
- **Bản chất kỹ thuật:** Container Writable Layer vs Docker Persistent Storage.
- **File bằng chứng:** `docker-compose.yml` (dòng 126-138).
- **Câu hỏi truy vấn sâu:** *Làm thế nào để dữ liệu của Prometheus không bao giờ bị mất khi chạy `docker compose down`?*
- **Câu trả lời tiếp theo:** Dạ, em chỉ cần khai báo thêm một Named Volume, ví dụ `prometheus_data:/prometheus` trong service `prometheus` của file `docker-compose.yml`.

---

### Câu 58: Sự khác biệt giữa `sum()` và `avg()` trong PromQL khi tính toán tải CPU là gì?
- **Câu trả lời sinh viên:** Dạ, `sum(rate(process_cpu_user_seconds_total[5m]))` sẽ cộng dồn tổng thời gian CPU của tất cả các tiến trình hoặc instance lại với nhau. Còn `avg(...)` sẽ lấy trung bình cộng. Nếu hệ thống sau này mở rộng chạy cụm 3 container backend, dùng `avg` sẽ cho biết mức tải trung bình của mỗi container, còn dùng `sum` sẽ cho biết tổng năng lực CPU mà toàn bộ hệ thống backend đang ngốn.
- **Bản chất kỹ thuật:** PromQL Vector Aggregation Operators.
- **Câu hỏi truy vấn sâu:** *Câu truy vấn `rate(process_cpu_user_seconds_total[5m])` trong Panel 2 trả về giá trị 0.05 nghĩa là gì?*
- **Câu trả lời tiếp theo:** Dạ, nghĩa là tiến trình Backend đang sử dụng khoảng 5% năng lực xử lý của 1 lõi CPU (Core).

---

## NHÓM 7: LOKI, PROMTAIL VÀ LOGQL

### Câu 59: Promtail phát hiện và đọc log từ các container bằng cách nào?
- **Câu trả lời sinh viên:** Dạ, Promtail sử dụng cơ chế **Docker Service Discovery** thông qua việc gắn kết tập tin socket của Docker Engine:
  `- /var/run/docker.sock:/var/run/docker.sock:ro`
  Docker daemon quản lý toàn bộ luồng xuất chuẩn (stdout/stderr) của các container dưới dạng stream. Promtail kết nối vào socket này, tự động quét danh sách container đang chạy mỗi 5 giây, đọc các dòng log phát sinh, gắn các nhãn siêu dữ liệu và đẩy về Loki qua API HTTP `:3100`.
- **Bản chất kỹ thuật:** Unix Domain Socket IPC & Docker Engine Events/Logging API.
- **File bằng chứng:** `docker-compose.yml` (dòng 170), `promtail/promtail-config.yml` (dòng 13-15).
- **Câu hỏi truy vấn sâu:** *Tại sao mount `docker.sock` lại phải thêm cờ `:ro` (Read-only)?*
- **Câu trả lời tiếp theo:** Dạ, đây là biện pháp bảo mật cực kỳ quan trọng! Socket của Docker có quyền lực tối thượng tương đương quyền root trên máy host. Gắn cờ `:ro` đảm bảo Promtail chỉ có quyền đọc log, không thể gửi các lệnh nguy hiểm như tạo container mới, dừng container hay xóa dữ liệu máy chủ.

---

### Câu 60: Quy tắc Relabeling trong file `promtail-config.yml` của em có nhiệm vụ gì?
- **Câu trả lời sinh viên:** Dạ, có 2 quy tắc rất thông minh:
  1. `regex: '/booking-.*'`, `action: keep`: Chỉ giữ lại log của các container thuộc dự án booking tour, bỏ qua toàn bộ container khác đang chạy trên máy tính.
  2. `regex: '/(.*)'`, `target_label: 'container_name'`: Bóc tách bỏ dấu gạch chéo `/` ở đầu tên container mà Docker tự sinh ra, chuyển thành nhãn sạch sẽ `container_name="booking-backend"` để dễ dàng truy vấn trên Grafana.
- **Bản chất kỹ thuật:** Promtail Metric/Log Relabel Configuration Stage.
- **File bằng chứng:** `promtail/promtail-config.yml` (dòng 16-24).
- **Câu hỏi truy vấn sâu:** *Nếu em không cấu hình dòng `action: keep` thì hậu quả là gì?*
- **Câu trả lời tiếp theo:** Dạ, Promtail sẽ thu thập log của tất cả các container của các phần mềm khác trên máy tính của thầy hoặc của em, làm rác kho lưu trữ Loki và khiến kết quả tìm kiếm bị lẫn lộn dữ liệu không liên quan.

---

### Câu 61: Em hãy giải thích câu truy vấn LogQL: `{container_name="booking-backend"} |= "error"`?
- **Câu trả lời sinh viên:** Dạ:
  - `{container_name="booking-backend"}`: Stream Selector, lọc đúng luồng log của container Backend.
  - `|= "error"`: Bộ lọc dòng (Line filter), chỉ giữ lại những dòng log nào có chứa chính xác chuỗi ký tự `"error"`.
  Câu truy vấn này giúp lập trình viên tìm nhanh các lỗi nghiêm trọng phát sinh trong mã nguồn Node.js mà không cần cuộn qua hàng nghìn dòng log bình thường.
- **Bản chất kỹ thuật:** LogQL Stream Selection and Substring Filter.
- **File bằng chứng:** `grafana/dashboards/booking-tour-overview.json` (Panel 8 dòng 145).
- **Câu hỏi truy vấn sâu:** *Nếu dòng log in ra chữ `Error` viết hoa chữ E thì câu lệnh trên có bắt được không?*
- **Câu trả lời tiếp theo:** Dạ không, vì toán tử `|=` phân biệt chữ hoa chữ thường (Case-sensitive). Để bắt được cả chữ hoa lẫn chữ thường, em sẽ dùng toán tử Regex:
  `{container_name="booking-backend"} |~ "(?i)error"`. Cờ `(?i)` nghĩa là Case-insensitive.

---

### Câu 62: LogQL khác PromQL ở những điểm cơ bản nào?
- **Câu trả lời sinh viên:** Dạ:
  - **PromQL (Prometheus):** Chỉ truy vấn trên dữ liệu chuỗi số (Time-series numbers). Mọi phép toán đều là tính toán số học trên vector (`rate`, `sum`, `avg`).
  - **LogQL (Loki):** Truy vấn trên luồng văn bản (Text streams). Nó hỗ trợ lọc chuỗi (`|=`, `!=`), lọc regex (`|~`), bóc tách định dạng JSON (`| json`), và cũng hỗ trợ các hàm biến đổi log thành số liệu (như `count_over_time`) để vẽ biểu đồ.
- **Bản chất kỹ thuật:** LogQL là phần mở rộng cú pháp của PromQL áp dụng cho luồng dữ liệu nhật ký văn bản.
- **Câu hỏi truy vấn sâu:** *Toán tử `!=` trong LogQL dùng để làm gì? Cho ví dụ?*
- **Câu trả lời tiếp theo:** Dạ, `!=` là bộ lọc loại trừ (Negative filter). Ví dụ em muốn xem toàn bộ log của Nginx nhưng muốn lọc bỏ các request kiểm tra sức khỏe lặp lại liên tục:
  `{container_name="booking-nginx"} != "GET / HTTP/1.1"`.

---

### Câu 63: Làm thế nào để lấy toàn bộ log truy cập của Nginx khi có mã lỗi 4xx hoặc 5xx bằng LogQL?
- **Câu trả lời sinh viên:** Dạ, em sử dụng biểu thức chính quy (Regex) khớp với định dạng access log của Nginx:
  `{container_name="booking-nginx"} |~ "HTTP/1.1\" [45][0-9]{2}"`
  Câu lệnh này sẽ bắt mọi dòng log có chứa mã trạng thái HTTP bắt đầu bằng số 4 (như 400, 401, 403, 404) hoặc số 5 (như 500, 502, 503).
- **Bản chất kỹ thuật:** LogQL Regex Pattern Matching over Nginx Common Log Format.
- **Câu hỏi truy vấn sâu:** *Nếu em muốn parse các trường của log Nginx thành dạng cột (IP, Method, Status) trên Grafana thì làm thế nào?*
- **Câu trả lời tiếp theo:** Dạ, nếu log Nginx được định dạng dạng JSON, em chỉ cần thêm pipe `| json`. Còn nếu là log dạng text chuẩn, em dùng pipe pattern: `| pattern "<ip> - - [<time>] \"<method> <uri> <proto>\" <status> <bytes>"` để bóc tách thành các trường riêng biệt.

---

### Câu 64: Trong Grafana, làm thế nào để em xem được log thời gian thực (Live Streaming Logs) như lệnh `docker compose logs -f`?
- **Câu trả lời sinh viên:** Dạ, trong giao diện Grafana Explore (`http://localhost:3001/explore`), sau khi nhập câu truy vấn LogQL, ở góc trên bên phải màn hình có nút **Live**. Em bấm vào nút Live, Grafana sẽ thiết lập kết nối WebSocket tới Loki và liên tục đẩy các dòng log mới phát sinh lên màn hình ngay khi có sự kiện xảy ra mà không cần tải lại trang.
- **Bản chất kỹ thuật:** Grafana WebSocket Live Streaming over Loki Tail API.
- **Câu hỏi truy vấn sâu:** *Cơ chế Live Stream này có tốn tài nguyên server không?*
- **Câu trả lời tiếp theo:** Dạ có, nó duy trì kết nối WebSocket liên tục và yêu cầu Loki phải stream dữ liệu real-time. Do đó chỉ nên bật khi đang trực tiếp gỡ lỗi hệ thống.

---

### Câu 65: Nếu mở Grafana Explore chọn Loki mà không thấy dòng log nào thì quy trình kiểm tra lỗi ra sao?
- **Câu trả lời sinh viên:** Dạ, quy trình 4 bước kiểm tra của em:
  1. Kiểm tra khoảng thời gian (Time Range) ở góc trên bên phải Grafana: đảm bảo đang chọn khoảng thời gian hợp lý (ví dụ *Last 1 hour* hoặc *Last 15 minutes*), tránh việc chọn nhầm ngày trong quá khứ.
  2. Kiểm tra container Promtail: chạy `docker compose logs promtail` xem có bị lỗi quyền truy cập file socket `/var/run/docker.sock` hay không.
  3. Kiểm tra container Loki: chạy `docker compose ps loki` xem Loki có đang chạy bình thường ở cổng 3100 không.
  4. Kiểm tra API nhãn của Loki bằng lệnh: `curl.exe http://localhost:3100/loki/api/v1/labels`. Nếu API này trả về danh sách labels rỗng nghĩa là Promtail chưa đẩy được log lên Loki.
- **Bản chất kỹ thuật:** Centralized Logging Pipeline Diagnostics.
- **File bằng chứng:** Đã kiểm chứng API labels thành công.
- **Câu hỏi truy vấn sâu:** *File `positions.yaml` trong Promtail có thể gây ra hiện tượng không thấy log mới không?*
- **Câu trả lời tiếp theo:** Dạ có, nếu Promtail ghi nhận con trỏ file log đã ở cuối cùng nhưng container không có hoạt động mới sinh ra log, Promtail sẽ đứng chờ. Ta chỉ cần tạo một thao tác truy cập trên web để kích hoạt log mới phát sinh.

---

### Câu 66: Loki lưu trữ dữ liệu log thành phần nào? Thư mục lưu trữ là gì?
- **Câu trả lời sinh viên:** Dạ, Loki chia dữ liệu thành 2 phần:
  1. **Index (Chỉ mục):** Lưu các nhãn và khoảng thời gian, được cấu hình lưu trữ bằng công nghệ `boltdb-shipper`.
  2. **Chunks (Khối dữ liệu nội dung):** Toàn bộ nội dung các dòng log sau khi được nén lại (gzip), lưu trực tiếp vào hệ thống tập tin (Filesystem) trong thư mục `/loki/chunks`.
  Toàn bộ dữ liệu này được ánh xạ ra Named Volume `loki_data` của Docker để đảm bảo không bị mất log khi khởi động lại.
- **Bản chất kỹ thuật:** Loki Boltdb-shipper Index and Chunk Storage Architecture.
- **File bằng chứng:** `loki/loki-config.yml` (dòng 8-11 và 23-31), `docker-compose.yml` (dòng 160).
- **Câu hỏi truy vấn sâu:** *Tại sao trong `loki-config.yml` em lại cấu hình `allow_structured_metadata: false`?*
- **Câu trả lời tiếp theo:** Dạ, vì image `loki:3.0.0` ở bản mới mặc định bật tính năng Structured Metadata vốn yêu cầu schema index v13 (TSDB). Để tương thích hoàn toàn với schema v11 của `boltdb-shipper` đang dùng, em tắt cờ này đi để hệ thống khởi chạy ổn định và không bị lỗi xung đột schema.

---

### Câu 67: Câu lệnh LogQL nào trong Dashboard Grafana dùng để đếm số lượng request qua Nginx Gateway?
- **Câu trả lời sinh viên:** Dạ, đó là câu lệnh trong Panel 9:
  `sum(count_over_time({container_name="booking-nginx"} [5m]))`
  Cứ mỗi một request đi qua Nginx sẽ sinh ra 1 dòng log truy cập. Hàm `count_over_time(... [5m])` đếm số lượng dòng log xuất hiện trong 5 phút, từ đó vẽ ra biểu đồ thể hiện tổng lưu lượng truy cập qua Gateway mà không cần cài thêm Exporter riêng cho Nginx.
- **Bản chất kỹ thuật:** Log-derived Metrics (Biến đổi nhật ký thành chỉ số số học).
- **File bằng chứng:** `grafana/dashboards/booking-tour-overview.json` (Panel 9 dòng 164).
- **Câu hỏi truy vấn sâu:** *Độ chính xác của việc đếm request qua log so với dùng Metrics exporter thế nào?*
- **Câu trả lời tiếp theo:** Dạ, độ chính xác gần như tương đương 100% vì mỗi request HTTP đều được Nginx ghi đúng 1 dòng log. Tuy nhiên về mặt tài nguyên, việc đếm qua log tốn CPU của Loki hơn một chút so với việc đọc trực tiếp 1 con số biến đếm Counter của Prometheus.

---

### Câu 68: Làm thế nào để kiểm tra danh sách 10 container đã nạp log vào Loki bằng dòng lệnh PowerShell?
- **Câu trả lời sinh viên:** Dạ, em sử dụng lệnh:
  `curl.exe -s http://localhost:3100/loki/api/v1/label/container_name/values`
  Kết quả trả về danh sách mảng JSON chứa đầy đủ tên 10 container: `booking-backend`, `booking-frontend`, `booking-grafana`, `booking-loki`, `booking-nginx`, `booking-pgadmin`, `booking-postgres`, `booking-postgres-exporter`, `booking-prometheus`, `booking-promtail`.
- **Bản chất kỹ thuật:** Loki Label Values API Inspection.
- **File bằng chứng:** Kết quả thực tế đã kiểm chứng trong terminal.
- **Câu hỏi truy vấn sâu:** *Nếu em muốn xóa sạch toàn bộ log cũ trong Loki thì làm thế nào?*
- **Câu trả lời tiếp theo:** Dạ, em chỉ cần chạy `docker compose down -v` để xóa volume `loki_data`, sau đó khởi động lại hệ thống thì kho log sẽ được tạo mới hoàn toàn.

---

## NHÓM 8: HARDENING VÀ BẢO MẬT HỆ THỐNG

### Câu 69: Hardening là gì và tại sao đề tài triển khai phần mềm lại bắt buộc phải có bước này?
- **Câu trả lời sinh viên:** Dạ thưa thầy, **Hardening** là quá trình gia cố, làm cứng hệ thống bằng cách loại bỏ các cấu hình mặc định lỏng lẻo, thu hẹp bề mặt tấn công, tước bỏ các quyền hạn không cần thiết và áp đặt các chính sách phòng thủ. Đề tài quản trị hệ thống bắt buộc phải có bước này vì trong môi trường thực tế, một hệ thống dù tính năng nghiệp vụ có tốt đến đâu nhưng nếu bị hacker xâm nhập, chiếm quyền root hoặc đánh cắp cơ sở dữ liệu thì toàn bộ doanh nghiệp sẽ bị đình trệ và vi phạm pháp luật về an toàn thông tin.
- **Bản chất kỹ thuật:** Attack Surface Reduction & Principle of Least Privilege.
- **File bằng chứng:** `docs/05_Hardening_Bao_mat.md`.
- **Câu hỏi truy vấn sâu:** *Hệ thống của em đã thực hiện được bao nhiêu biện pháp Hardening có bằng chứng xác minh?*
- **Câu trả lời tiếp theo:** Dạ, hệ thống của em đã thực hiện thành công và có bằng chứng kỹ thuật rõ ràng cho **7 biện pháp**: Non-root container, Cô lập mạng 4 tầng, Giới hạn port public, Bảo vệ secrets qua .env, Read-only mounts cho socket và config, Bộ 6 tiêu đề bảo mật HTTP, và Bảo mật ứng dụng với Rate-limit/JWT HttpOnly/Bcrypt/Upload Whitelist.

---

### Câu 70: Tại sao chạy Container với quyền root lại nguy hiểm và em đã cấu hình Non-root như thế nào?
- **Câu trả lời sinh viên:** Dạ, mặc định container dùng chung nhân Linux Kernel với máy host. Nếu container chạy user `root` (UID 0), kẻ tấn công khi tìm được lỗ hổng RCE có thể khai thác các lỗi nhân (Container Escape) để chiếm quyền root của chính máy chủ vật lý, từ đó kiểm soát toàn bộ máy tính.
  Em đã cấu hình Non-root bằng 2 cách:
  1. Trong `backend/Dockerfile`, em khai báo dòng `USER node` (UID 1000).
  2. Trong `frontend/Dockerfile` và `docker-compose.yml`, em dùng image `nginxinc/nginx-unprivileged:alpine` chạy user `nginx` (UID 101).
- **Bản chất kỹ thuật:** Linux User Namespaces & Privilege Separation.
- **File bằng chứng:** `backend/Dockerfile` (dòng 7), `docker-compose.yml` (dòng 103).
- **Câu hỏi truy vấn sâu:** *Nếu một tiến trình non-root trong container bị chiếm quyền thì hacker có thể làm gì?*
- **Câu trả lời tiếp theo:** Dạ, hacker chỉ có quyền hạn của user thường bên trong không gian tên cô lập của container đó. Chúng không thể cài thêm phần mềm hệ thống, không thể sửa các file hệ thống của Linux, và quan trọng nhất là không thể thoát ra ngoài máy host.

---

### Câu 71: Tại sao việc mount file `/var/run/docker.sock` vào container Promtail lại là một rủi ro bảo mật tiềm ẩn và em đã hạn chế rủi ro đó ra sao?
- **Câu trả lời sinh viên:** Dạ, `docker.sock` là cổng giao tiếp trực tiếp với Docker Daemon. Bất kỳ ai có quyền ghi vào file socket này đều có thể điều khiển Docker Engine tạo ra các container có quyền `privileged`, mount toàn bộ ổ cứng máy host và chiếm máy chủ trong vài giây.
  Em đã hạn chế rủi ro này bằng 2 biện pháp:
  1. Gắn cờ **Chỉ đọc (`:ro`)**: `/var/run/docker.sock:/var/run/docker.sock:ro`. Promtail chỉ có quyền đọc stream log, hoàn toàn không có quyền gửi lệnh điều khiển Docker API.
  2. Cô lập container Promtail chỉ nằm trong mạng `monitor-net`, không mở bất kỳ cổng nào ra máy host.
- **Bản chất kỹ thuật:** Docker Daemon Socket Exposure & Read-Only Bind Mount Mitigation.
- **File bằng chứng:** `docker-compose.yml` (dòng 170).
- **Câu hỏi truy vấn sâu:** *Có giải pháp nào thay thế việc mount `docker.sock` hoàn toàn không?*
- **Câu trả lời tiếp theo:** Dạ có, trong môi trường sản xuất người ta có thể sử dụng Docker Logging Driver trực tiếp (ví dụ cấu hình Docker daemon dùng driver `loki` để tự đẩy log về Loki), khi đó không cần container Promtail và không cần mount `docker.sock`.

---

### Câu 72: Em đã bảo vệ các API quản trị của Backend khỏi các cuộc tấn công đánh cắp quyền hạn như thế nào?
- **Câu trả lời sinh viên:** Dạ, em áp dụng cơ chế xác thực đa lớp:
  1. Phân tách rõ ràng giữa Token của Nhân viên (`typ='admin'`) và Token của Khách hàng (`typ='customer'`). Middleware `authenticateToken` sẽ từ chối ngay lập tức nếu khách hàng cố dùng token của mình để gọi API quản trị.
  2. Kiểm tra vai trò cụ thể qua middleware `requireRole(['admin', 'staff', 'ketoan'])`. Ví dụ tài khoản kế toán (`ketoan`) chỉ có quyền xem danh sách đơn và thống kê, không có quyền đổi trạng thái đơn hay sửa giá tour.
  3. Token được lưu trữ trong Cookie với cờ `httpOnly: true`, ngăn chặn hoàn toàn việc mã độc JavaScript đánh cắp token qua lỗ hổng XSS.
- **Bản chất kỹ thuật:** Role-Based Access Control (RBAC) & HttpOnly Cookie Mitigation against XSS.
- **File bằng chứng:** `backend/src/middleware/authMiddleware.js`.
- **Câu hỏi truy vấn sâu:** *Cờ `SameSite` trong cookie có tác dụng gì?*
- **Câu trả lời tiếp theo:** Dạ, cờ `SameSite` (thường đặt là `Strict` hoặc `Lax`) giúp chống lại cuộc tấn công giả mạo yêu cầu từ trang web khác (Cross-Site Request Forgery - CSRF). Nó quy định trình duyệt không được tự động gửi kèm cookie khi request xuất phát từ một tên miền của bên thứ ba.

---

### Câu 73: Tính năng Giới hạn tần suất gọi (Rate Limiting) trong Backend của em hoạt động thế nào?
- **Câu trả lời sinh viên:** Dạ, em sử dụng thư viện `express-rate-limit` tại file `rateLimiter.js`, chia thành các mức bảo vệ:
  - `loginLimiter`: Giới hạn tối đa 10 lần thử đăng nhập hoặc xác thực OTP trong 15 phút để chống tấn công dò mật khẩu (Brute-force).
  - `bookingLimiter`: Giới hạn tối đa 10 lần gửi đơn đặt tour trong 15 phút để chống bot chiếm ghế và spam email xác nhận.
  - `promoLimiter`: Giới hạn 20 lần thử mã giảm giá để chống bot vét cạn mã voucher.
  Nếu vượt quá ngưỡng, hệ thống sẽ trả về mã lỗi `HTTP 429 Too Many Requests`.
- **Bản chất kỹ thuật:** In-memory Sliding Window Rate Limiting Algorithm.
- **File bằng chứng:** `backend/src/middleware/rateLimiter.js`.
- **Câu hỏi truy vấn sâu:** *Nếu hệ thống sau này chạy nhiều instance backend (Cluster) thì Rate Limiter lưu trong bộ nhớ còn hiệu quả không?*
- **Câu trả lời tiếp theo:** Dạ sẽ bị giảm hiệu quả vì mỗi instance có bộ nhớ RAM riêng. Khi chạy đa instance, em sẽ cấu hình `express-rate-limit` sử dụng bộ lưu trữ tập trung ngoài là **Redis** (`rate-limit-redis`) để tất cả các instance backend cùng chia sẻ chung một bộ đếm.

---

### Câu 74: Em đã phòng chống lỗ hổng Tải lên tập tin độc hại (Malicious File Upload) như thế nào?
- **Câu trả lời sinh viên:** Dạ, tại file `backend/src/routes/uploadRoutes.js`:
  1. Chỉ có Admin và Staff có token hợp lệ mới được quyền gọi API upload.
  2. Whitelist loại MIME-type nghiêm ngặt: chỉ chấp nhận 4 định dạng ảnh `image/jpeg`, `image/png`, `image/gif`, `image/webp`. Mọi file `.exe`, `.sh`, `.php` đều bị từ chối ngay lập tức.
  3. Tên file lưu trên ổ đĩa được sinh ngẫu nhiên hoàn toàn bằng `Date.now() + Math.random()`, và đuôi mở rộng (`.jpg`, `.png`) được **gán cố định từ MIME-type do server xác thực**, tuyệt đối không dùng phần mở rộng từ tên file của người dùng gửi lên.
  4. Giới hạn dung lượng file tối đa là `5MB`.
- **Bản chất kỹ thuật:** Strict Content-Type Whitelisting & Secure Filename Generation against Path Traversal / Webshell Execution.
- **File bằng chứng:** `backend/src/routes/uploadRoutes.js` (dòng 14-45).
- **Câu hỏi truy vấn sâu:** *Nếu hacker đổi tên file mã độc `shell.php` thành `shell.jpg` rồi upload lên thì hệ thống có bị lừa không?*
- **Câu trả lời tiếp theo:** Dạ không, vì Nginx chỉ phục vụ thư mục `/uploads/` dưới dạng file tĩnh, không có trình thông dịch PHP hay Node.js nào thực thi các file trong thư mục này; đồng thời header `X-Content-Type-Options: nosniff` sẽ ngăn trình duyệt tự ý thực thi file đó dưới dạng script.

---

### Câu 75: Truy vấn SQL trong Backend của em có bị dính lỗ hổng SQL Injection không? Tại sao?
- **Câu trả lời sinh viên:** Dạ hoàn toàn không thể bị SQL Injection thưa thầy! Vì toàn bộ 100% các câu truy vấn cơ sở dữ liệu trong backend em đều sử dụng cơ chế **Truy vấn tham số hóa (Parameterized Queries)** của thư viện `pg` với các ký hiệu giữ chỗ `$1, $2, $3...` (ví dụ `client.query("SELECT * FROM users WHERE email = $1", [email])`). Trình điều khiển PostgreSQL sẽ gửi câu lệnh SQL và dữ liệu của người dùng tách rời nhau. Cơ sở dữ liệu coi dữ liệu người dùng thuần túy là chuỗi giá trị (Literal value), không bao giờ biên dịch nó thành mã lệnh thực thi, triệt tiêu hoàn toàn khả năng chèn mã độc dạng `' OR 1=1 --`.
- **Bản chất kỹ thuật:** Separation of SQL Code and User Data via Prepared Statements.
- **File bằng chứng:** `backend/src/controllers/bookingController.js`, `authController.js`.
- **Câu hỏi truy vấn sâu:** *Khi nào thì việc dùng Parameterized Query vẫn có nguy cơ bị SQL Injection?*
- **Câu trả lời tiếp theo:** Dạ, đó là khi lập trình viên dùng kỹ thuật cộng chuỗi để đưa tên bảng (Table name) hoặc tên cột (Column name) vào câu lệnh, ví dụ `SELECT * FROM " + tableName`, vì các tham số `$1` chỉ áp dụng cho giá trị dữ liệu chứ không áp dụng cho định danh cấu trúc (Identifiers). Trong dự án, toàn bộ tên bảng và cột của em đều được viết cố định, không cộng chuỗi từ input người dùng.

---

### Câu 76: Cú pháp `${POSTGRES_PASSWORD:?...}` trong `docker-compose.yml` có tác dụng bảo mật gì?
- **Câu trả lời sinh viên:** Dạ, đây là cú pháp kiểm tra biến bắt buộc của Docker Compose (Parameter Expansion with Mandatory Check). Nếu người cài đặt quên tạo file `.env` hoặc để trống biến `POSTGRES_PASSWORD`, Docker Compose sẽ lập tức dừng quá trình khởi chạy và in ra thông báo lỗi cảnh báo: `Thiếu POSTGRES_PASSWORD trong .env — xem .env.example`. Nó ngăn chặn triệt để tình trạng hệ thống tự động khởi chạy với mật khẩu rỗng hoặc mật khẩu mặc định yếu kém.
- **Bản chất kỹ thuật:** Shell Parameter Expansion Syntax for Strict Environment Validation.
- **File bằng chứng:** `docker-compose.yml` (dòng 9, 29, 43, 73).
- **Câu hỏi truy vấn sâu:** *Sự khác nhau giữa cú pháp `${VAR:-default}` và `${VAR:?error}` là gì?*
- **Câu trả lời tiếp theo:** Dạ, cú pháp `:-` sẽ tự động lấy giá trị mặc định nếu biến không tồn tại (thường dùng cho các cấu hình không nhạy cảm như cổng `PORT=3000`). Còn cú pháp `:?` sẽ báo lỗi và dừng toàn bộ chương trình ngay lập tức, bắt buộc người dùng phải cung cấp giá trị (dùng cho các thông tin bảo mật tối quan trọng như mật khẩu).

---

## NHÓM 9: XỬ LÝ SỰ CỐ THỰC TẾ (TROUBLESHOOTING)

### Câu 77: Khi vừa chạy `docker compose up -d`, container `booking-backend` bị trạng thái `Exited (255)` hoặc sập liên tục, em sẽ làm gì?
- **Câu trả lời sinh viên:** Dạ, quy trình xử lý của em:
  1. Chạy lệnh `docker compose logs backend` để đọc thông điệp lỗi cuối cùng trước khi tiến trình tắt.
  2. Hai nguyên nhân phổ biến nhất:
     - Thiếu biến môi trường bắt buộc (như `JWT_SECRET` hoặc `POSTGRES_PASSWORD`) khiến ứng dụng Node.js thoát ngay ở dòng khởi tạo.
     - Cổng `3000` trên máy host đang bị một phần mềm khác chiếm giữ (ví dụ một tiến trình Node dev chạy ngoài máy thật).
  3. Nếu do chiếm cổng, em dùng lệnh `netstat -ano | findstr :3000` trên Windows để tìm mã tiến trình PID và tắt nó đi, sau đó chạy lại `docker compose up -d backend`.
- **Bản chất kỹ thuật:** Process Exit Diagnostic & Port Conflict Resolution.
- **File bằng chứng:** `README.md` (Mục 22 Troubleshooting).
- **Câu hỏi truy vấn sâu:** *Mã thoát `Exited (137)` của container biểu thị điều gì?*
- **Câu trả lời tiếp theo:** Dạ, mã 137 biểu thị tiến trình bị tiêu diệt bởi tín hiệu `SIGKILL` (128 + 9). Nguyên nhân phổ biến nhất là container bị cạn kiệt bộ nhớ và bị cơ chế OOM Killer của Linux bắn hạ do vượt quá mức RAM giới hạn.

---

### Câu 78: Trên Grafana, bảng điều khiển Prometheus hiển thị `No data` ở tất cả các panel, em sẽ kiểm tra theo thứ tự nào?
- **Câu trả lời sinh viên:** Dạ, quy trình 3 bước:
  1. Kiểm tra Prometheus Server: Truy cập `http://localhost:9090/targets` xem 3 Target có đang ở trạng thái UP hay không. Nếu target `booking-backend` bị DOWN (màu đỏ), em sẽ kiểm tra xem container Backend có đang chạy không.
  2. Kiểm tra Datasource trên Grafana: Vào Grafana -> Connections -> Data sources -> bấm vào `Prometheus` -> bấm nút **Save & test** ở cuối trang xem có báo màu xanh "Successfully queried the Prometheus API" hay không.
  3. Kiểm tra khoảng thời gian (Time Range): Xem góc trên bên phải dashboard có đang bị chọn vào khoảng thời gian trong quá khứ không có dữ liệu hay không.
- **Bản chất kỹ thuật:** Observability Pipeline End-to-End Troubleshooting.
- **Câu hỏi truy vấn sâu:** *Nếu Target trong Prometheus báo lỗi `context deadline exceeded` thì nghĩa là sao?*
- **Câu trả lời tiếp theo:** Dạ, nghĩa là Prometheus đã gửi request tới target nhưng quá thời gian chờ (`scrape_timeout`, mặc định 10s) mà target không kịp trả về dữ liệu metrics, thường do target đang bị treo hoặc mạng nội bộ bị nghẽn.

---

### Câu 79: Khách hàng phản ánh rằng họ bấm đặt tour nhưng hệ thống báo lỗi 500, em sẽ điều tra từ đâu?
- **Câu trả lời sinh viên:** Dạ, quy trình điều tra vết lỗi của em:
  1. Mở Grafana Explore, chọn Datasource **Loki**, nhập truy vấn:
     `{container_name="booking-backend"} |= "error"`
     để xem chính xác thông báo lỗi và dòng code bị quăng ngoại lệ (Stack trace).
  2. Nếu lỗi liên quan đến database (ví dụ lỗi vi phạm CHECK constraint hoặc khóa ngoại), em kiểm tra dữ liệu khách gửi lên.
  3. Nếu lỗi do gửi email xác nhận thất bại (ví dụ tài khoản Gmail SMTP bị khóa hoặc sai App Password), em kiểm tra cấu hình SMTP trong file `.env`.
- **Bản chất kỹ thuật:** Centralized Log Inspection & Root Cause Analysis.
- **File bằng chứng:** `backend/src/controllers/bookingController.js` (khối `catch(error)`).
- **Câu hỏi truy vấn sâu:** *Tại sao lỗi gửi email không nên làm cho API đặt tour bị trả về mã 500?*
- **Câu trả lời tiếp theo:** Dạ hoàn toàn chính xác! Trong code của em tại dòng 184-196 của `bookingController.js`, việc gọi `sendBookingConfirmationEmail` được viết bằng `.then().catch()`, tách rời khỏi Transaction của Database. Ngay cả khi gửi email bị lỗi mạng, đơn đặt tour trong database vẫn thành công và API vẫn trả về mã 201 cho khách hàng, chỉ in lỗi ra log để nhân viên kỹ thuật xử lý.

---

### Câu 80: Nếu ổ cứng máy chủ bị đầy (Disk Full 100%), những container nào trong hệ thống sẽ bị ảnh hưởng đầu tiên?
- **Câu trả lời sinh viên:** Dạ, hai container sẽ bị sập đầu tiên là:
  1. **`booking-postgres`:** PostgreSQL có cơ chế bảo vệ rất nghiêm ngặt, khi không thể ghi tiếp vào file nhật ký ghi trước (Write-Ahead Logging - WAL), PostgreSQL sẽ tự động chuyển sang chế độ dừng khẩn cấp (Panic shutdown) để bảo vệ tính toàn vẹn dữ liệu, từ chối mọi giao dịch ghi mới.
  2. **`booking-loki`:** Loki không thể ghi tiếp các khối log mới vào thư mục `/loki/chunks` và sẽ liên tục báo lỗi từ chối nhận log từ Promtail.
- **Bản chất kỹ thuật:** WAL Flush Failure in Database Engine & Append-only Log Storage Exhaustion.
- **Câu hỏi truy vấn sâu:** *Làm thế nào để dọn dẹp các image và container rác để giải phóng dung lượng Docker nhanh nhất?*
- **Câu trả lời tiếp theo:** Dạ, em sử dụng lệnh dọn dẹp hệ thống của Docker:
  `docker system prune -a` (Lưu ý không dùng cờ `--volumes` để tránh mất dữ liệu database). Lệnh này sẽ xóa toàn bộ các container đã tắt, các mạng không dùng và các image rác không còn gắn với container nào.

---

### Câu 81: Giả sử em quên mật khẩu của tài khoản quản trị viên trong bảng `users`, em lấy lại quyền truy cập bằng cách nào?
- **Câu trả lời sinh viên:** Dạ, em có 2 cách rất nhanh:
  - **Cách 1 (Dùng script của dự án):** Chạy lệnh:
    `docker compose exec backend npm run seed`
    Script `backend/seed.js` đã được em viết sẵn cơ chế Idempotent, nó sẽ tự động cập nhật hoặc tạo lại tài khoản quản trị mặc định `admin` với mật khẩu được băm lại là `admin123`.
  - **Cách 2 (Dùng SQL trực tiếp):** Vào dòng lệnh `docker exec -it booking-postgres psql -U booking_admin -d booking_tour`, chạy câu lệnh `UPDATE users SET password_hash = '...' WHERE username = 'admin';` với chuỗi băm bcrypt mới.
- **Bản chất kỹ thuật:** Administrative Password Reset via Seed Script / Direct Database Update.
- **File bằng chứng:** `backend/seed.js`.
- **Câu hỏi truy vấn sâu:** *Tính chất Idempotent (Bất biến) trong script seed nghĩa là gì?*
- **Câu trả lời tiếp theo:** Dạ, nghĩa là script đó có thể chạy đi chạy lại nhiều lần mà kết quả hệ thống vẫn giữ nguyên ở trạng thái mong muốn, không sinh ra lỗi bản ghi trùng lặp (Duplicate Key Error) nhờ sử dụng câu lệnh `ON CONFLICT (...) DO UPDATE` hoặc kiểm tra sự tồn tại trước khi tạo mới.

---

### Câu 82: Nếu container `postgres-exporter` báo trạng thái Target DOWN trong Prometheus với lỗi xác thực mật khẩu, em kiểm tra ở đâu?
- **Câu trả lời sinh viên:** Dạ, em kiểm tra dòng khai báo `DATA_SOURCE_NAME` trong file `docker-compose.yml` (dòng 43). Nếu mật khẩu của database chứa các ký tự đặc biệt như dấu `@`, `#`, `$`, hoặc nháy đơn `'`, thư viện phân giải URL của exporter có thể bị hiểu nhầm ký tự. Trong dự án, em đã cấu hình định dạng từ khóa (Keyword DSN):
  `DATA_SOURCE_NAME: "host=postgres port=5432 user=booking_admin password='${POSTGRES_PASSWORD}' dbname=booking_tour sslmode=disable"`
  nhờ đặt password trong cặp dấu nháy đơn `'...'`, mật khẩu sẽ không bị lỗi phân giải chuỗi.
- **Bản chất kỹ thuật:** Connection String DSN Format vs URL-encoded Connection URI Parsing.
- **File bằng chứng:** `docker-compose.yml` (dòng 41-43), `README.md` (Mục 22).
- **Câu hỏi truy vấn sâu:** *Tại sao trong môi trường Docker nội bộ DSN lại để `sslmode=disable`?*
- **Câu trả lời tiếp theo:** Dạ, vì container `postgres-exporter` và `postgres` giao tiếp qua mạng nội bộ Docker cô lập (`db-net`), không đi qua mạng công cộng bên ngoài. Việc tắt SSL mode giúp giảm độ trễ bắt tay mã hóa và giảm tải CPU cho exporter.

---

## NHÓM 10: PHẢN BIỆN NÂNG CAO VÀ THIẾT KẾ HỆ THỐNG

### Câu 83: Nếu hệ thống của em có 100.000 người dùng truy cập cùng lúc trong dịp Tết thì kiến trúc hiện tại sẽ nghẽn ở đâu đầu tiên? Em sẽ mở rộng (Scale) như thế nào?
- **Câu trả lời sinh viên:** Dạ thưa thầy, điểm nghẽn (Bottleneck) đầu tiên sẽ là **Cơ sở dữ liệu PostgreSQL** (quá tải số lượng kết nối và nghẽn I/O đọc ổ cứng), tiếp theo là **Backend Node.js** (đơn luồng bị nghẽn Event Loop).
  Kế hoạch mở rộng 4 bước của em:
  1. **Caching với Redis:** Đặt một cụm Redis Cache phía trước Backend để lưu cache danh sách tour nổi bật và thông tin tour chi tiết. 90% lượt xem tour sẽ lấy từ RAM của Redis, không cần truy vấn vào PostgreSQL.
  2. **Tách đọc/ghi Database (Read Replicas):** Cấu hình mô hình Master - Slave cho PostgreSQL. Các thao tác xem tour sẽ đọc từ cụm Slave (Read Replicas), chỉ các thao tác đặt tour mới ghi vào Master.
  3. **Mở rộng ngang Backend (Horizontal Scaling):** Chạy nhiều bản sao container backend (`docker compose up --scale backend=5`), Nginx đóng vai trò Load Balancer phân phối tải theo thuật toán Round Robin hoặc Least Connections.
  4. **Tích hợp Message Queue (RabbitMQ / Kafka):** Đưa các tác vụ nặng như gửi email xác nhận đặt tour vào hàng đợi tin nhắn để xử lý ngầm không đồng bộ.
- **Bản chất kỹ thuật:** High Availability & Scalability Architecture (Read/Write Splitting, Distributed Caching, Message-driven Architecture).
- **Câu hỏi truy vấn sâu:** *Tại sao không tăng cấu hình máy host (Vertical Scaling - Scale Up) mà lại chọn mở rộng ngang (Horizontal Scaling)?*
- **Câu trả lời tiếp theo:** Dạ, nâng cấp cấu hình máy host (tăng CPU, RAM) luôn có giới hạn phần cứng vật lý và chi phí tăng theo cấp số nhân, đồng thời vẫn tiềm ẩn rủi ro sập toàn bộ hệ thống nếu máy chủ đó gặp sự cố phần cứng. Mở rộng ngang cho phép hệ thống mở rộng không giới hạn bằng các máy chủ giá rẻ và mang lại tính sẵn sàng cao (High Availability).

---

### Câu 84: Giữa việc triển khai bằng Docker Compose và triển khai bằng Kubernetes (K8s), đề tài này đang ở mức nào và khác biệt ra sao?
- **Câu trả lời sinh viên:** Dạ, đề tài của em đang triển khai ở mức **Docker Compose**, phù hợp hoàn hảo cho môi trường phát triển cục bộ, kiểm thử và các hệ thống vừa và nhỏ chạy trên một máy chủ đơn lẻ (Single-node).
  Khác biệt cốt lõi với **Kubernetes**:
  - Docker Compose không có khả năng tự động điều phối trên nhiều máy chủ vật lý khác nhau (Multi-node cluster), không có tính năng tự động mở rộng theo tải thực tế (Auto-scaling / HPA), và không có cơ chế tự động phát hiện và thay thế node bị chết (Self-healing trên cụm phân tán).
  - Kubernetes là nền tảng điều phối cấp doanh nghiệp lớn, quản lý hàng nghìn container trên nhiều cụm máy chủ, nhưng đổi lại độ phức tạp cấu hình và chi phí vận hành hạ tầng cao hơn rất nhiều.
- **Bản chất kỹ thuật:** Single-node Orchestration vs Distributed Container Orchestration Platform.
- **Câu hỏi truy vấn sâu:** *Nếu chuyển dự án này sang Kubernetes, các file trong dự án sẽ được ánh xạ thành các đối tượng K8s nào?*
- **Câu trả lời tiếp theo:** Dạ:
  - Các service (`backend`, `nginx`, `frontend`) sẽ chuyển thành các đối tượng **Deployment** và **ReplicaSet**.
  - Các cổng mạng nội bộ sẽ chuyển thành **ClusterIP Service**, Nginx chuyển thành **Ingress Controller**.
  - File `.env` chuyển thành **Secret** và **ConfigMap**.
  - Các Named Volume chuyển thành **PersistentVolumeClaim (PVC)** và **StorageClass**.

---

### Câu 85: Tại sao em lại cấu hình `app.set('trust proxy', 1)` trong Backend Node.js? Rủi ro bảo mật nếu cấu hình sai là gì?
- **Câu trả lời sinh viên:** Dạ, `trust proxy 1` ra lệnh cho framework Express tin tưởng proxy ở bước nhảy đầu tiên (chính là Nginx). Nhờ đó Express sẽ đọc IP của người dùng từ header `X-Forwarded-For` do Nginx gửi sang.
  Rủi ro bảo mật: Nếu không có Nginx mà Backend mở cổng trực tiếp ra Internet nhưng vẫn bật `trust proxy`, hacker có thể tự ý giả mạo header `X-Forwarded-For: 127.0.0.1` trong request của chúng để vượt qua các lớp bảo mật kiểm tra IP hoặc qua mặt Rate Limiting. Vì vậy chỉ bật `trust proxy` khi ứng dụng thực sự nằm sau một Reverse Proxy tin cậy.
- **Bản chất kỹ thuật:** IP Spoofing via Untrusted Proxy Header Injection.
- **File bằng chứng:** `backend/src/server.js` (dòng 20).
- **Câu hỏi truy vấn sâu:** *Số `1` trong `trust proxy, 1` có ý nghĩa cụ thể là gì?*
- **Câu trả lời tiếp theo:** Dạ, số `1` chỉ định số lượng bước nhảy (hop count) của proxy tin cậy. Express sẽ chỉ lấy địa chỉ IP ở vị trí thứ nhất tính từ phía Nginx quay ngược lại, ngăn chặn việc hacker chèn thêm chuỗi IP giả mạo phía trước.

---

### Câu 86: Nếu có một cuộc tấn công từ chối dịch vụ phân tán (DDoS) 100.000 requests/giây dội vào cổng 8888, hệ thống của em có trụ được không? Giải pháp thực tế là gì?
- **Câu trả lời sinh viên:** Dạ thưa thầy, hệ thống hiện tại chắc chắn sẽ bị tê liệt hoàn toàn! Vì Nginx chạy trên máy chủ đơn lẻ sẽ bị nghẽn băng thông mạng máy host và cạn kiệt tài nguyên CPU/RAM.
  Giải pháp thực tế: Không một máy chủ đơn lẻ nào có thể tự chống lại tấn công DDoS băng thông lớn ở tầng ứng dụng. Trong thực tế, bắt buộc phải đưa hệ thống ra sau các dịch vụ bảo vệ cạnh đám mây (Edge Cloud Security) như **Cloudflare**, **AWS Shield**, hoặc **Akamai**. Các dịch vụ này sở hữu mạng lưới Anycast toàn cầu với băng thông hàng trăm Terabit/giây, sẽ phân tán và lọc sạch lưu lượng tấn công trước khi chuyển tiếp các request sạch về máy chủ Nginx gốc.
- **Bản chất kỹ thuật:** DDoS Mitigation via Anycast CDN & Edge WAF.
- **Câu hỏi truy vấn sâu:** *Ở mức cấu hình Nginx cục bộ, có chỉ thị nào giúp giảm thiểu một phần các cuộc tấn công flood request nhỏ không?*
- **Câu trả lời tiếp theo:** Dạ có, Nginx hỗ trợ module `limit_req_zone` để giới hạn tần suất request theo IP (ví dụ `rate=10r/s`), kết hợp với `limit_conn_zone` để giới hạn số kết nối đồng thời từ một địa chỉ IP.

---

### Câu 87: Toàn bộ quá trình từ lúc lập trình viên commit code đến khi code được deploy lên Docker trong thực tế gọi là gì? Em sẽ thiết kế luồng đó ra sao?
- **Câu trả lời sinh viên:** Dạ, đó là quy trình tự động hóa **CI/CD (Continuous Integration / Continuous Deployment)**.
  Em sẽ thiết kế quy trình bằng **GitHub Actions**:
  1. **Giai đoạn CI (Tích hợp liên tục):** Khi lập trình viên tạo Pull Request vào nhánh `main`, GitHub Actions tự động kích hoạt workflow: cài đặt thư viện, chạy kiểm thử tự động (Unit Test / Linting), và quét lỗ hổng bảo mật mã nguồn (SonarQube/Trivy).
  2. **Giai đoạn Build Image:** Tự động build Docker Image cho `backend` và `frontend`, gắn thẻ phiên bản bằng Git Commit SHA, và đẩy (Push) image lên kho chứa **Docker Hub** hoặc **GitHub Container Registry (GHCR)**.
  3. **Giai đoạn CD (Triển khai liên tục):** Tự động SSH vào máy chủ sản xuất, kéo image mới về và thực hiện lệnh `docker compose up -d` với chiến lược cập nhật không gián đoạn dịch vụ (Zero-downtime Rolling Update).
- **Bản chất kỹ thuật:** DevOps Automation Pipeline (CI/CD Workflow).
- **Câu hỏi truy vấn sâu:** *Làm thế nào để cập nhật container mới mà người dùng đang truy cập website không bị gián đoạn (Zero Downtime)?*
- **Câu trả lời tiếp theo:** Dạ, ta khởi chạy container phiên bản mới song song với container cũ, chờ đến khi container mới vượt qua bước kiểm tra sức khỏe (Healthcheck passed), sau đó Nginx thực hiện tải lại cấu hình (`nginx -s reload`) để chuyển hướng lưu lượng sang container mới, rồi mới tắt container cũ đi.

---

### Câu 88: Bài học lớn nhất mà em rút ra được sau khi hoàn thành đề tài Quản trị và Triển khai Hệ thống này là gì?
- **Câu trả lời sinh viên:** Dạ thưa các thầy trong hội đồng, bài học lớn nhất em rút ra được là: **Một phần mềm tốt không chỉ dừng lại ở việc viết đúng tính năng nghiệp vụ, mà chất lượng thực sự nằm ở năng lực vận hành, giám sát và bảo mật của hệ thống đó.** Việc đóng gói ứng dụng bằng Docker giúp em hiểu sâu sắc về cách thức các dịch vụ cô lập và giao tiếp qua mạng; việc cấu hình Nginx Reverse Proxy rèn luyện cho em tư duy thiết kế cổng an toàn; và đặc biệt là hệ thống giám sát Prometheus, Grafana cùng log tập trung Loki giúp em không còn phải "đoán mò" khi hệ thống gặp sự cố mà hoàn toàn dựa trên các bằng chứng số liệu và nhật ký thời gian thực. Đây là hành trang quý giá nhất giúp em tự tin bước vào công việc kỹ sư phần mềm và DevOps thực tế.
- **Bản chất kỹ thuật:** Tổng kết tư duy kỹ thuật hệ thống (System Thinking & Operational Excellence).
