const pool = require('./src/db');

const seedGuides = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS guides (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE,
                phone VARCHAR(20),
                avatar VARCHAR(255),
                experience_years INTEGER,
                languages VARCHAR(100),
                bio TEXT,
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert 5 realistic guides
        const insertQuery = `
            INSERT INTO guides (full_name, email, phone, avatar, experience_years, languages, bio, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (email) DO NOTHING
        `;

        const guides = [
            ['Trần Lương Bảo', 'baotran@vuotravel.com', '0912111222', 'https://randomuser.me/api/portraits/men/32.jpg', 5, 'Tiếng Việt, Tiếng Anh', 'Hướng dẫn viên năng động, hiểu biết sâu sắc về lịch sử và văn hóa Kinh Bắc. Luôn mang lại tiếng cười cho du khách.', 'Active'],
            ['Nguyễn Hương Giang', 'giangnguyen@vuotravel.com', '0988777666', 'https://randomuser.me/api/portraits/women/44.jpg', 7, 'Tiếng Việt, Tiếng Trung', 'Với 7 năm kinh nghiệm dẫn tour tâm linh, Giang luôn biết cách truyền đạt những câu chuyện phật giáo đầy ý nghĩa tại Chùa Dâu, Bút Tháp.', 'Active'],
            ['Lê Minh Phúc', 'phucle@vuotravel.com', '0901234567', 'https://randomuser.me/api/portraits/men/46.jpg', 3, 'Tiếng Việt', 'Chuyên gia dẫn các cung đường trekking và cắm trại Mẫu Sơn, Đồng Cao. Kỹ năng sinh tồn tốt và siêu nhiệt tình.', 'Active'],
            ['Hoàng Thị Mai', 'maihoang@vuotravel.com', '0977888999', 'https://randomuser.me/api/portraits/women/68.jpg', 10, 'Tiếng Việt, Tiếng Pháp', 'HDV kỳ cựu với chất giọng truyền cảm. Chuyên dẫn các đoàn khách quốc tế và tour thưởng thức dân ca Quan họ làng Diềm.', 'Active'],
            ['Phạm Quốc Tuấn', 'tuanpham@vuotravel.com', '0933222111', 'https://randomuser.me/api/portraits/men/22.jpg', 4, 'Tiếng Việt, Tiếng Hàn', 'Trẻ trung, am hiểu ẩm thực địa phương. Tuấn luôn tìm ra những góc check-in tuyệt đẹp và các quán ăn ngon rẻ cho đoàn.', 'Active']
        ];

        for (const g of guides) {
            await pool.query(insertQuery, g);
        }

        console.log('Successfully created guides table and inserted 5 guides!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding guides:', err);
        process.exit(1);
    }
};

seedGuides();
