const pool = require('./src/db');
async function run() {
  try {
    await pool.query(`
      INSERT INTO promotions (code, discount_type, discount_value, min_booking_value, start_date, end_date, usage_limit, is_active)
      VALUES 
      ('HE2026', 'percent', 25, 500000, '2026-06-01', '2026-09-30', 100, true),
      ('GIAM10', 'percent', 10, 300000, null, null, null, true),
      ('VIP20', 'percent', 20, 1000000, null, null, 50, true),
      ('COMBO30', 'percent', 30, 800000, '2026-09-01', '2026-10-31', 200, true),
      ('SINHNHAT50', 'percent', 50, 1000000, '2026-01-01', '2026-12-31', null, true)
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('Inserted 5 promotions successfully.');
  } catch (err) {
    console.error('Error inserting promotions:', err);
  } finally {
    process.exit(0);
  }
}
run();
