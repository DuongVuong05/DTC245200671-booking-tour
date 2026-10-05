// Migration một lần: thêm cột note vào bảng bookings cho DB đang chạy (init.sql chỉ áp dụng cho DB mới).
// Chạy: node add_note_column.js (idempotent — bỏ qua nếu cột đã tồn tại)
const pool = require('./src/db');

async function run() {
  try {
    const check = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'note'"
    );
    if (check.rows.length === 0) {
      await pool.query('ALTER TABLE bookings ADD COLUMN note TEXT');
      console.log('Đã thêm cột note vào bảng bookings.');
    } else {
      console.log('Cột note đã tồn tại — bỏ qua.');
    }
  } catch (err) {
    console.error('Lỗi migration note:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();
