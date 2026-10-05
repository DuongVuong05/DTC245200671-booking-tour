const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const getBearerToken = (req) =>
  req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

// Xác thực token ADMIN/STAFF (cookie `token`), bắt buộc claim typ='admin'
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || getBearerToken(req);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.typ !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Not an admin token' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

// Xác thực token CUSTOMER (cookie `customer_token`), bắt buộc claim typ='customer'
const authenticateCustomer = (req, res, next) => {
    const token = req.cookies.customer_token || getBearerToken(req);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No customer token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.typ !== 'customer') {
            return res.status(403).json({ message: 'Forbidden: Not a customer token' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

// Route public: token nào cũng được, có thì gắn vào req.user (ưu tiên customer_token)
const optionalAuth = (req, res, next) => {
    const token = req.cookies.customer_token || req.cookies.token || getBearerToken(req);
    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            // Ignore invalid token in optional auth
        }
    }
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
};

module.exports = { authenticateToken, authenticateCustomer, requireRole, optionalAuth };
