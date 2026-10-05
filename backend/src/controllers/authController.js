const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

const { JWT_SECRET } = require('../config');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
        }
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
        }

        // Bỏ qua check verified nếu là admin khởi tạo ban đầu (chưa có email)
        if (user.role !== 'admin' || user.email) {
            if (!user.is_verified) {
                return res.status(401).json({ 
                    message: 'Tài khoản chưa được xác nhận Email. Vui lòng nhập mã OTP đã được gửi tới email của bạn.',
                    requireOtp: true,
                    username: user.username 
                });
            }
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, typ: 'admin' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Không trả token trong body — chỉ giữ trong httpOnly cookie
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    const { username, password, role, email, phone } = req.body;
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const { rows: existingUser } = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const targetRole = ['admin', 'staff', 'ketoan'].includes(role) ? role : 'staff';
        // OTP sinh bằng crypto (không dùng Math.random) + hết hạn sau 10 phút
        const verificationToken = crypto.randomInt(100000, 1000000).toString();

        const { rows } = await db.query(
            "INSERT INTO users (username, password_hash, role, email, phone, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '10 minutes') RETURNING id, username, role, email, phone",
            [username, hash, targetRole, email, phone, verificationToken]
        );

        // Gửi email (KHÔNG log OTP ra console)
        await emailService.sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'User created successfully. Please verify email.', user: rows[0] });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { username, otp } = req.body;
    try {
        // Chỉ chấp nhận OTP còn hạn (10 phút) và đúng mã
        const { rows } = await db.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL, otp_attempts = 0 WHERE username = $1 AND verification_token = $2 AND verification_token_expires > NOW() RETURNING id, username',
            [username, otp]
        );

        if (rows.length === 0) {
            // Tăng số lần thử sai; quá 5 lần thì vô hiệu mã OTP (phải cấp lại)
            await db.query(
                'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE username = $1 AND verification_token IS NOT NULL',
                [username]
            );
            await db.query(
                'UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE username = $1 AND otp_attempts >= 5',
                [username]
            );
            return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
        }

        res.json({ message: 'Xác thực OTP thành công! Bạn có thể đăng nhập.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
};

exports.getMe = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ user: req.user });
};

exports.customerRegister = async (req, res) => {
    const { full_name, email, password, phone, address } = req.body;
    try {
        const { rows: existing } = await db.query('SELECT * FROM customers WHERE email = $1', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const { rows } = await db.query(
            'INSERT INTO customers (full_name, email, password_hash, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email',
            [full_name, email, hash, phone, address || '']
        );
        
        res.status(201).json({ message: 'Customer registered successfully', user: rows[0] });
    } catch (error) {
        console.error('Customer register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.customerLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await db.query('SELECT * FROM customers WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const customer = rows[0];
        
        if (!customer.password_hash) {
            return res.status(401).json({ message: 'Please register with a password first' });
        }

        const isMatch = await bcrypt.compare(password, customer.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { id: customer.id, email: customer.email, role: 'customer', typ: 'customer' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('customer_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Không trả token trong body — chỉ giữ trong httpOnly cookie
        res.json({
            message: 'Login successful',
            user: { id: customer.id, full_name: customer.full_name, email: customer.email, phone: customer.phone, role: 'customer' }
        });
    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.customerLogout = (req, res) => {
    res.clearCookie('customer_token');
    res.json({ message: 'Customer logout successful' });
};

// Admin: Get all staff/admin users
exports.getAllUsers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, username, email, phone, is_verified, role, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'staff', 'ketoan'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const { rows } = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
            [role, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Role updated successfully', user: rows[0] });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent admin from deleting themselves
        if (parseInt(req.user.id) === parseInt(id)) {
            return res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình' });
        }
        const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update user (Full edit)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, phone, role, password } = req.body;
    
    try {
        if (!['admin', 'staff', 'ketoan'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        let query = 'UPDATE users SET username = $1, email = $2, phone = $3, role = $4';
        let values = [username, email, phone, role];
        let index = 5;
        
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            query += `, password_hash = $${index}`;
            values.push(hash);
            index++;
        }
        
        query += ` WHERE id = $${index} RETURNING id, username, email, phone, role`;
        values.push(id);
        
        const { rows } = await db.query(query, values);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Cập nhật tài khoản thành công', user: rows[0] });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

