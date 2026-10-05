// Seed 6 tour nổi bật của Vuo Travel (idempotent — upsert theo tên tour).
// Đồng thời tạo lịch khởi hành tương lai nếu tour chưa có lịch nào.
// Chạy: node seed_tours.js (hoặc npm run seed:tours)
const pool = require('./src/db');

const TOURS = [
  {
    name: 'TOUR TÂM LINH KINH BẮC: CHÙA DÂU - BÚT THÁP - ĐỀN ĐÔ',
    description: 'Hành trình chiêm bái những ngôi chùa cổ kính bậc nhất vùng Kinh Bắc: Chùa Dâu - ngôi chùa cổ nhất Việt Nam, Chùa Bút Tháp với tượng Quan Âm nghìn mắt nghìn tay, và Đền Đô - nơi thờ 8 vị vua triều Lý.',
    destination: 'BẮC NINH - CHÙA DÂU - BÚT THÁP - ĐỀN ĐÔ',
    price: 650000, duration: '1 Ngày', image_url: '/tour1.jpg',
    old_price: 850000, discount: '-23%', rating: 5, rating_count: 12,
    schedule_note: 'Thứ 7 - CN Hàng Tuần', vehicle: 'Xe du lịch đời mới', hotel: 'Không áp dụng',
  },
  {
    name: 'HÀNH TRÌNH QUAN HỌ: LÀNG DIỀM - THƯỞNG THỨC DÂN CA',
    description: 'Về Làng Diềm - cái nôi của dân ca Quan họ, viếng Đền Cùng - Giếng Ngọc và trải nghiệm mặc trang phục mớ ba mớ bảy, têm trầu cánh phượng, giao lưu hát Quan họ cùng liền anh liền chị.',
    destination: 'BẮC NINH - LÀNG DIỀM - ĐỀN CÙNG GIẾNG NGỌC',
    price: 950000, duration: '1 Ngày', image_url: '/tour25.jpg',
    old_price: 1200000, discount: '-25%', rating: 4, rating_count: 8,
    schedule_note: 'Chủ Nhật Hàng Tuần', vehicle: 'Xe du lịch 16 chỗ', hotel: 'Không áp dụng',
  },
  {
    name: 'TOUR KHÁM PHÁ TÂY YÊN TỬ: CHỐN LINH THIÊNG CÕI PHẬT',
    description: 'Chiêm bái Thiền Viện Trúc Lâm Tây Yên Tử, trải nghiệm cáp treo lên đỉnh núi, viếng chùa Vĩnh Nghiêm với mộc bản kinh Phật được UNESCO công nhận.',
    destination: 'BẮC GIANG - TÂY YÊN TỬ - THIỀN VIỆN TRÚC LÂM',
    price: 1850000, duration: '2 Ngày 1 Đêm', image_url: '/tyt.webp',
    old_price: 2150000, discount: '-14%', rating: 5, rating_count: 25,
    schedule_note: 'Hàng ngày', vehicle: 'Xe ghế ngồi 29 chỗ', hotel: '3 Sao++',
  },
  {
    name: 'TOUR LÀNG NGHỀ TRUYỀN THỐNG: ĐÔNG HỒ - PHÙ LÃNG - THỔ HÀ',
    description: 'Tự tay in tranh Đông Hồ, nặn đất sét tại làng gốm Phù Lãng và dạo bước những con ngõ tường tiểu sành độc đáo của làng cổ Thổ Hà bên dòng sông Cầu.',
    destination: 'BẮC NINH - ĐÔNG HỒ - PHÙ LÃNG - THỔ HÀ',
    price: 750000, duration: '1 Ngày', image_url: '/tour3.jpg',
    old_price: 950000, discount: '-20%', rating: 5, rating_count: 15,
    schedule_note: 'Thứ 7 - CN Hàng Tuần', vehicle: 'Xe ghế ngồi bật đời mới', hotel: 'Không áp dụng',
  },
  {
    name: 'TOUR DẤU ẤN LỊCH SỬ: XƯƠNG GIANG - HOÀNG HOA THÁM',
    description: 'Tham quan Thành cổ Xương Giang, chiêm ngưỡng cây Dã Hương nghìn năm tuổi và viếng khu di tích Hoàng Hoa Thám - dấu ấn cuộc khởi nghĩa Yên Thế.',
    destination: 'BẮC GIANG - XƯƠNG GIANG - HOÀNG HOA THÁM',
    price: 550000, duration: '1 Ngày', image_url: '/xg.jpg',
    old_price: 850000, discount: '-35%', rating: 5, rating_count: 20,
    schedule_note: 'Thứ 7 - CN Hàng Tuần', vehicle: 'Xe du lịch đời mới', hotel: 'Không áp dụng',
  },
  {
    name: 'TOUR KHÁM PHÁ ĐẠI NGÀN: KHE RỖ - ĐỒNG CAO',
    description: 'Trekking rừng tự nhiên Khe Rỗ, lội suối, cắm trại và ngắm bình minh trên thảo nguyên Đồng Cao - Mẫu Sơn của Bắc Giang.',
    destination: 'BẮC GIANG - KHE RỖ - ĐỒNG CAO',
    price: 1400000, duration: '2 Ngày 1 Đêm', image_url: '/dongcao.jpg',
    old_price: 2000000, discount: '-30%', rating: 5, rating_count: 18,
    schedule_note: 'Cuối tuần Hàng Tuần', vehicle: 'Xe ghế ngồi 29 chỗ', hotel: 'Homestay',
  },
];

const GUIDES = ['Nguyễn Văn Minh', 'Trần Thu Hà', 'Phạm Quốc Tuấn', 'Nguyễn Kiều Oanh', 'Lê Hoàng Sơn'];

// Tour 2 ngày trở lên: ngày về = ngày đi + 1
const returnOffset = (duration) => (String(duration).includes('2 Ngày') ? 1 : 0);

async function run() {
  try {
    for (const tour of TOURS) {
      const existing = await pool.query('SELECT id FROM tours WHERE name = $1', [tour.name]);

      let tourId;
      if (existing.rows.length > 0) {
        tourId = existing.rows[0].id;
        await pool.query(
          `UPDATE tours SET
             description = $1, destination = $2, price = $3, duration = $4, image_url = $5,
             is_featured = TRUE, old_price = $6, discount = $7, rating = $8, rating_count = $9,
             schedule_note = $10, vehicle = $11, hotel = $12
           WHERE id = $13`,
          [tour.description, tour.destination, tour.price, tour.duration, tour.image_url,
           tour.old_price, tour.discount, tour.rating, tour.rating_count,
           tour.schedule_note, tour.vehicle, tour.hotel, tourId]
        );
        console.log(`Đã cập nhật tour #${tourId}: ${tour.name}`);
      } else {
        const inserted = await pool.query(
          `INSERT INTO tours (name, description, destination, price, duration, image_url,
             is_featured, old_price, discount, rating, rating_count, schedule_note, vehicle, hotel)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
          [tour.name, tour.description, tour.destination, tour.price, tour.duration, tour.image_url,
           tour.old_price, tour.discount, tour.rating, tour.rating_count,
           tour.schedule_note, tour.vehicle, tour.hotel]
        );
        tourId = inserted.rows[0].id;
        console.log(`Đã thêm tour #${tourId}: ${tour.name}`);
      }

      // Đảm bảo có lịch khởi hành tương lai (nếu tour chưa có lịch nào trong tương lai)
      const futureSchedules = await pool.query(
        'SELECT COUNT(*) FROM tour_schedules WHERE tour_id = $1 AND departure_date >= CURRENT_DATE',
        [tourId]
      );
      if (parseInt(futureSchedules.rows[0].count, 10) === 0) {
        const offset = returnOffset(tour.duration);
        for (let i = 0; i < 3; i++) {
          const daysAhead = 7 + i * 7;
          await pool.query(
            `INSERT INTO tour_schedules (tour_id, departure_date, return_date, available_seats, guide_name)
             VALUES ($1, CURRENT_DATE + $2, CURRENT_DATE + $3, $4, $5)`,
            [tourId, daysAhead, daysAhead + offset, 25, GUIDES[i % GUIDES.length]]
          );
        }
        console.log(`Đã tạo 3 lịch khởi hành tương lai cho tour #${tourId}`);
      }
    }
    console.log('Seed tours hoàn tất.');
  } catch (err) {
    console.error('Lỗi seed tours:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();
