// Migration một lần: thêm các cột mới cho bảng tours (DB đang chạy).
// Chạy: node add_tour_columns.js (idempotent — bỏ qua các cột đã tồn tại)
const pool = require('./src/db');

const COLUMNS = [
  { name: 'included', type: 'TEXT' },
  { name: 'excluded', type: 'TEXT' },
  { name: 'policy', type: 'TEXT' },
  { name: 'gallery', type: 'TEXT' },
  { name: 'is_featured', type: 'BOOLEAN DEFAULT FALSE' },
  { name: 'old_price', type: 'NUMERIC' },
  { name: 'discount', type: 'VARCHAR(10)' },
  { name: 'rating', type: 'NUMERIC' },
  { name: 'rating_count', type: 'INTEGER DEFAULT 0' },
  { name: 'schedule_note', type: 'VARCHAR(100)' },
  { name: 'vehicle', type: 'VARCHAR(100)' },
  { name: 'hotel', type: 'VARCHAR(100)' },
];

async function run() {
  try {
    for (const col of COLUMNS) {
      const check = await pool.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = $1",
        [col.name]
      );
      if (check.rows.length === 0) {
        await pool.query(`ALTER TABLE tours ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Đã thêm cột tours.${col.name}.`);
      } else {
        console.log(`Cột tours.${col.name} đã tồn tại — bỏ qua.`);
      }
    }
  } catch (err) {
    console.error('Lỗi migration tours:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();
