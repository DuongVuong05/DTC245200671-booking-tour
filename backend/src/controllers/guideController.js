const pool = require('../db');

exports.getAllGuides = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guides ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách hướng dẫn viên' });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM guides WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy hướng dẫn viên' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const { full_name, email, phone, avatar, experience_years, languages, bio, status } = req.body;
    const result = await pool.query(
      'INSERT INTO guides (full_name, email, phone, avatar, experience_years, languages, bio, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [full_name, email, phone, avatar, experience_years, languages, bio, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi thêm hướng dẫn viên' });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, avatar, experience_years, languages, bio, status } = req.body;
    const result = await pool.query(
      'UPDATE guides SET full_name = $1, email = $2, phone = $3, avatar = $4, experience_years = $5, languages = $6, bio = $7, status = $8 WHERE id = $9 RETURNING *',
      [full_name, email, phone, avatar, experience_years, languages, bio, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy hướng dẫn viên' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật hướng dẫn viên' });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM guides WHERE id = $1', [id]);
    res.json({ message: 'Xóa hướng dẫn viên thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi xóa' });
  }
};
