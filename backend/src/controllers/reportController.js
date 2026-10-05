const pool = require("../db");

const getDashboardStats = async (req, res) => {
  try {
    // Doanh thu = đơn đã xác nhận/hoàn thành (thống nhất với /api/bookings/stats)
    const revenueResult = await pool.query(
      "SELECT SUM(total_price) as revenue FROM bookings WHERE status IN ('Confirmed', 'Completed')"
    );
    const revenue = revenueResult.rows[0].revenue || 0;

    const bookingsResult = await pool.query("SELECT COUNT(*) as count FROM bookings");
    const bookingsCount = bookingsResult.rows[0].count || 0;

    const customersResult = await pool.query("SELECT COUNT(*) as count FROM customers");
    const customersCount = customersResult.rows[0].count || 0;

    // Get real 7 days data from database
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const chartResult = await pool.query(
      `SELECT DATE(booking_date) as booking_date, SUM(total_price) as daily_revenue
       FROM bookings
       WHERE status IN ('Confirmed', 'Completed') AND booking_date >= $1
       GROUP BY DATE(booking_date)
       ORDER BY DATE(booking_date) ASC`,
      [sevenDaysAgo]
    );

    // Initialize array with 7 days of 0 revenue
    const chartData = [];
    const today = new Date();
    
    // Create a map from DB results
    const dbDataMap = {};
    chartResult.rows.forEach(row => {
      // row.booking_date might be a Date object or string depending on pg driver
      const dateObj = new Date(row.booking_date);
      const dateKey = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      dbDataMap[dateKey] = parseFloat(row.daily_revenue) / 1000000; // Convert to millions for UI
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      chartData.push({ 
        name: dateStr, 
        revenue: dbDataMap[dateStr] || 0 
      });
    }

    res.json({
      revenue: parseInt(revenue, 10),
      bookingsCount: parseInt(bookingsCount, 10),
      customersCount: parseInt(customersCount, 10),
      chartData: chartData
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = { getDashboardStats };
