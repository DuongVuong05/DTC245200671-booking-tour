CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    price NUMERIC NOT NULL,
    duration VARCHAR(50),
    image_url VARCHAR(255),
    included TEXT,
    excluded TEXT,
    policy TEXT,
    gallery TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    old_price NUMERIC,
    discount VARCHAR(10),
    rating NUMERIC,
    rating_count INTEGER DEFAULT 0,
    schedule_note VARCHAR(100),
    vehicle VARCHAR(100),
    hotel VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(10),
    verification_token_expires TIMESTAMP,
    otp_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    seat_capacity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percent' or 'fixed'
    discount_value NUMERIC NOT NULL,
    min_booking_value NUMERIC DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tour_schedules (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    available_seats INTEGER NOT NULL,
    guide_name VARCHAR(100),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guides (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    experience_years INTEGER DEFAULT 1,
    languages VARCHAR(255),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS explore_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    img VARCHAR(255),
    icon VARCHAR(20),
    detail TEXT,
    has_video BOOLEAN DEFAULT FALSE,
    video_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    tour_schedule_id INTEGER REFERENCES tour_schedules(id) ON DELETE CASCADE,
    promotion_id INTEGER REFERENCES promotions(id) ON DELETE SET NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    num_people INTEGER NOT NULL,
    total_price NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending',
    note TEXT
);

-- 6 tour nổi bật của Vuo Travel (hiển thị ở trang chủ mục "TOUR NỔI BẬT")
INSERT INTO tours (name, description, destination, price, duration, image_url, is_featured, old_price, discount, rating, rating_count, schedule_note, vehicle, hotel, included, excluded, policy) VALUES
('TOUR TÂM LINH KINH BẮC: CHÙA DÂU - BÚT THÁP - ĐỀN ĐÔ', 'Hành trình chiêm bái những ngôi chùa cổ kính bậc nhất vùng Kinh Bắc: Chùa Dâu - ngôi chùa cổ nhất Việt Nam, Chùa Bút Tháp với tượng Quan Âm nghìn mắt nghìn tay, và Đền Đô - nơi thờ 8 vị vua triều Lý.', 'BẮC NINH - CHÙA DÂU - BÚT THÁP - ĐỀN ĐÔ', 650000, '1 Ngày', '/tour1.jpg', TRUE, 850000, '-23%', 5, 12, 'Thứ 7 - CN Hàng Tuần', 'Xe du lịch đời mới', 'Không áp dụng', 'Xe đưa đón theo chương trình
HDV tiếng Việt suốt tuyến
Vé tham quan các điểm
Bữa trưa đặc sản Kinh Bắc', 'Chi phí cá nhân
Đồ uống trong bữa ăn', 'Hủy miễn phí trước 24 giờ khởi hành
Trẻ em dưới 5 tuổi miễn phí (ngồi chung ghế)'),
('HÀNH TRÌNH QUAN HỌ: LÀNG DIỀM - THƯỞNG THỨC DÂN CA', 'Về Làng Diềm - cái nôi của dân ca Quan họ, viếng Đền Cùng - Giếng Ngọc và trải nghiệm mặc trang phục mớ ba mớ bảy, têm trầu cánh phượng, giao lưu hát Quan họ cùng liền anh liền chị.', 'BẮC NINH - LÀNG DIỀM - ĐỀN CÙNG GIẾNG NGỌC', 950000, '1 Ngày', '/tour25.jpg', TRUE, 1200000, '-25%', 4, 8, 'Chủ Nhật Hàng Tuần', 'Xe du lịch 16 chỗ', 'Không áp dụng', 'Xe đưa đón theo chương trình
HDV tiếng Việt suốt tuyến
Chương trình giao lưu Quan họ
Bữa trưa đặc sản địa phương', 'Chi phí cá nhân
Đồ uống trong bữa ăn', 'Hủy miễn phí trước 24 giờ khởi hành
Trẻ em dưới 5 tuổi miễn phí (ngồi chung ghế)'),
('TOUR KHÁM PHÁ TÂY YÊN TỬ: CHỐN LINH THIÊNG CÕI PHẬT', 'Chiêm bái Thiền Viện Trúc Lâm Tây Yên Tử, trải nghiệm cáp treo lên đỉnh núi, viếng chùa Vĩnh Nghiêm với mộc bản kinh Phật được UNESCO công nhận.', 'BẮC GIANG - TÂY YÊN TỬ - THIỀN VIỆN TRÚC LÂM', 1850000, '2 Ngày 1 Đêm', '/tyt.webp', TRUE, 2150000, '-14%', 5, 25, 'Hàng ngày', 'Xe ghế ngồi 29 chỗ', '3 Sao++', 'Xe đưa đón theo chương trình
Khách sạn 3 sao++ (2 khách/phòng)
Bữa sáng, trưa, tối theo chương trình
Vé cáp treo Tây Yên Tử
HDV tiếng Việt suốt tuyến', 'Chi phí cá nhân
Đồ uống trong bữa ăn
Phụ thu phòng đơn', 'Hủy miễn phí trước 48 giờ khởi hành
Trẻ em dưới 5 tuổi miễn phí (ngủ chung giường)'),
('TOUR LÀNG NGHỀ TRUYỀN THỐNG: ĐÔNG HỒ - PHÙ LÃNG - THỔ HÀ', 'Tự tay in tranh Đông Hồ, nặn đất sét tại làng gốm Phù Lãng và dạo bước những con ngõ tường tiểu sành độc đáo của làng cổ Thổ Hà bên dòng sông Cầu.', 'BẮC NINH - ĐÔNG HỒ - PHÙ LÃNG - THỔ HÀ', 750000, '1 Ngày', '/tour3.jpg', TRUE, 950000, '-20%', 5, 15, 'Thứ 7 - CN Hàng Tuần', 'Xe ghế ngồi bật đời mới', 'Không áp dụng', 'Xe đưa đón theo chương trình
HDV tiếng Việt suốt tuyến
Trải nghiệm in tranh Đông Hồ
Vé tham quan làng nghề
Bữa trưa đặc sản địa phương', 'Chi phí cá nhân
Đồ uống trong bữa ăn', 'Hủy miễn phí trước 24 giờ khởi hành
Trẻ em dưới 5 tuổi miễn phí (ngồi chung ghế)'),
('TOUR DẤU ẤN LỊCH SỬ: XƯƠNG GIANG - HOÀNG HOA THÁM', 'Tham quan Thành cổ Xương Giang, chiêm ngưỡng cây Dã Hương nghìn năm tuổi và viếng khu di tích Hoàng Hoa Thám - dấu ấn cuộc khởi nghĩa Yên Thế.', 'BẮC GIANG - XƯƠNG GIANG - HOÀNG HOA THÁM', 550000, '1 Ngày', '/xg.jpg', TRUE, 850000, '-35%', 5, 20, 'Thứ 7 - CN Hàng Tuần', 'Xe du lịch đời mới', 'Không áp dụng', 'Xe đưa đón theo chương trình
HDV tiếng Việt suốt tuyến
Vé tham quan các di tích
Bữa trưa đặc sản địa phương', 'Chi phí cá nhân
Đồ uống trong bữa ăn', 'Hủy miễn phí trước 24 giờ khởi hành
Trẻ em dưới 5 tuổi miễn phí (ngồi chung ghế)'),
('TOUR KHÁM PHÁ ĐẠI NGÀN: KHE RỖ - ĐỒNG CAO', 'Trekking rừng tự nhiên Khe Rỗ, lội suối, cắm trại và ngắm bình minh trên thảo nguyên Đồng Cao - Mẫu Sơn của Bắc Giang.', 'BẮC GIANG - KHE RỖ - ĐỒNG CAO', 1400000, '2 Ngày 1 Đêm', '/dongcao.jpg', TRUE, 2000000, '-30%', 5, 18, 'Cuối tuần Hàng Tuần', 'Xe ghế ngồi 29 chỗ', 'Homestay', 'Xe đưa đón theo chương trình
Homestay (2-4 khách/phòng)
Bữa sáng, trưa, tối theo chương trình
HDV tiếng Việt suốt tuyến', 'Chi phí cá nhân
Đồ uống trong bữa ăn
Phụ thu phòng đơn', 'Hủy miễn phí trước 48 giờ khởi hành
Trẻ em dưới 5 tuổi miễn phí (ngủ chung giường)');

INSERT INTO customers (full_name, email, phone, address) VALUES
('Nguyễn Văn An', 'nguyenvanan@gmail.com', '0912345678', 'Hà Nội'),
('Trần Thị Bình', 'tranbinh@gmail.com', '0987654321', 'Bắc Ninh'),
('Lê Văn Cường', 'levancuong@gmail.com', '0901122334', 'Hải Phòng')
ON CONFLICT (email) DO NOTHING;

-- Lịch khởi hành mẫu: dùng ngày tương đối (CURRENT_DATE + N) để DB mới luôn có lịch tương lai
INSERT INTO tour_schedules (tour_id, departure_date, return_date, available_seats, guide_name) VALUES
(1, CURRENT_DATE + 7,  CURRENT_DATE + 7,  25, 'Nguyễn Văn Minh'),
(1, CURRENT_DATE + 14, CURRENT_DATE + 14, 30, 'Trần Thu Hà'),
(2, CURRENT_DATE + 6,  CURRENT_DATE + 6,  20, 'Phạm Quốc Tuấn'),
(3, CURRENT_DATE + 9,  CURRENT_DATE + 10, 15, 'Nguyễn Kiều Oanh'),
(3, CURRENT_DATE + 16, CURRENT_DATE + 17, 20, 'Trần Thu Hà'),
(4, CURRENT_DATE + 8,  CURRENT_DATE + 8,  24, 'Phạm Quốc Tuấn'),
(5, CURRENT_DATE + 7,  CURRENT_DATE + 7,  28, 'Nguyễn Văn Minh'),
(6, CURRENT_DATE + 10, CURRENT_DATE + 11, 22, 'Lê Hoàng Sơn'),
(6, CURRENT_DATE + 17, CURRENT_DATE + 18, 22, 'Lê Hoàng Sơn');

INSERT INTO bookings (customer_id, tour_schedule_id, num_people, total_price, status) VALUES
(1, 1, 2, 1300000, 'Confirmed'),
(2, 3, 1, 950000, 'Pending');

-- Mục "KHÁM PHÁ BẮC NINH" ở trang chủ (quản lý tại Admin → Khám phá Bắc Ninh)
INSERT INTO explore_items (title, description, img, icon, detail, has_video, video_url) VALUES
('Văn hóa', 'Quan họ Kinh Bắc', '/qh.jpg', '🎵', 'Dân ca Quan họ Bắc Ninh là một trong những làn điệu dân ca tiêu biểu của vùng châu thổ sông Hồng.', TRUE, '/qhh.mp4'),
('Lịch sử', 'Dấu ấn triều Lý', '/tour1.jpg', '📜', 'Triều Lý là một trong những triều đại phát triển rực rỡ nhất trong lịch sử Việt Nam.', FALSE, NULL),
('Khoa bảng', 'Vùng đất hiếu học', '/tnt.jpg', '📚', 'Kinh Bắc tự hào là vùng đất "Một giỏ ông đồ, một bồ ông cống".', FALSE, NULL),
('Làng nghề', 'Đông Hồ – Phù Lãng', '/tranhdh.jpg', '🎨', 'Bắc Ninh nổi tiếng với các làng nghề truyền thống hàng trăm năm tuổi.', FALSE, NULL),
('Thiên nhiên', 'Núi rừng – sinh thái', '/dongcao.jpg', '🌿', 'Bên cạnh vẻ đẹp văn hóa, vùng đất này còn được thiên nhiên ban tặng những cảnh quan tuyệt đẹp.', FALSE, NULL),
('Ẩm thực', 'Hương vị Kinh Bắc', '/vaithieu.jpg', '🍜', 'Đến Kinh Bắc, du khách không thể bỏ qua những thức quà quê dân dã.', FALSE, NULL)
ON CONFLICT (id) DO NOTHING;

-- Thêm CHECK constraints
ALTER TABLE tours ADD CONSTRAINT chk_price CHECK (price >= 0);
ALTER TABLE tours ADD CONSTRAINT chk_old_price CHECK (old_price >= 0);
ALTER TABLE tour_schedules ADD CONSTRAINT chk_dates CHECK (return_date >= departure_date);
ALTER TABLE tour_schedules ADD CONSTRAINT chk_seats CHECK (available_seats >= 0);
ALTER TABLE bookings ADD CONSTRAINT chk_num_people CHECK (num_people > 0);
ALTER TABLE bookings ADD CONSTRAINT chk_total_price CHECK (total_price >= 0);
ALTER TABLE promotions ADD CONSTRAINT chk_discount_value CHECK (discount_value >= 0);

-- Thêm index để tăng tốc độ truy vấn
CREATE INDEX idx_tours_is_featured ON tours(is_featured);
CREATE INDEX idx_tours_destination ON tours(destination);
CREATE INDEX idx_tour_schedules_dates ON tour_schedules(departure_date, return_date);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_tour_schedule_id ON bookings(tour_schedule_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);