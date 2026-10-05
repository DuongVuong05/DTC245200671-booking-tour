const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Whitelist: chỉ chấp nhận các định dạng ảnh thông dụng,
// phần mở rộng được gán từ mimetype (KHÔNG lấy từ tên file người dùng)
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = ALLOWED_MIME_TYPES[file.mimetype] || '';
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)!'), false);
    }
  }
});

router.post('/', authenticateToken, requireRole(['admin', 'staff']), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không tìm thấy file tải lên hợp lệ' });
    }
    // Trả về đường dẫn tương đối để hoạt động trên mọi host/port
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    res.status(500).json({ error: 'Lỗi server khi upload ảnh' });
  }
});

module.exports = router;
