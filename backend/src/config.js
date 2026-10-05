// Cấu hình tập trung - fail fast nếu thiếu biến bắt buộc
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Please set it in backend/.env (dev) or docker-compose environment (Docker).');
    process.exit(1);
}

module.exports = { JWT_SECRET };
