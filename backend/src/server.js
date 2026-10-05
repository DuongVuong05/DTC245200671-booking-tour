require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const promClient = require("prom-client");

const promRegister = new promClient.Registry();
promClient.collectDefaultMetrics({ register: promRegister });

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Tổng số HTTP request theo method, route, status",
  labelNames: ["method", "route", "status"],
  registers: [promRegister],
});

const app = express();
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.on("finish", () => {
    const route = req.path.replace(/\/\d+/g, "/:id");
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
  });
  next();
});

const CORS_ORIGINS = (process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://localhost:8082,http://localhost:8888')
  .split(',').map((o) => o.trim());
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body ?? {};
  next();
});

const PORT = process.env.PORT || 3000;

const tourRoutes = require("./routes/tourRoutes");
const scheduleRoutes = require("./routes/tourScheduleRoutes");
const customerRoutes = require("./routes/customerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const exploreRoutes = require("./routes/exploreRoutes");
const guideRoutes = require("./routes/guideRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/guides", guideRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.get("/", (req, res) => {
  res.send("Booking Tour System is running!");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promRegister.contentType);
  res.end(await promRegister.metrics());
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Body JSON không hợp lệ' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Booking Tour server is running at http://localhost:${PORT}`);
});
