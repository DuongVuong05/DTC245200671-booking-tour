const pool = require('./src/db');
async function run() {
  try {
    await pool.query(`
      INSERT INTO vehicles (name, type, license_plate, seat_capacity, status)
      VALUES 
      ('Ford Transit Luxury 2025', 'Xe Limousine', '29B-123.45', 16, 'Active'),
      ('Hyundai Universe VIP', 'Xe Khách Lớn', '29B-567.89', 45, 'Active'),
      ('Thaco Garden 79s', 'Xe Khách Trung', '30F-999.99', 29, 'Maintenance'),
      ('Toyota Hiace Tiêu Chuẩn', 'Xe Đưa Đón', '29D-111.22', 16, 'Active'),
      ('Kia Sedona Premium', 'Xe Gia Đình / Limousine', '30G-888.68', 7, 'Active')
      ON CONFLICT (license_plate) DO NOTHING
    `);
    console.log('Inserted 5 vehicles successfully.');
  } catch (err) {
    console.error('Error inserting vehicles:', err);
  } finally {
    process.exit(0);
  }
}
run();
