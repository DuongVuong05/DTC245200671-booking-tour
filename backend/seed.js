const pool = require('./src/db');
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => {
    return pool.query(
        "INSERT INTO users (username, password_hash, role, is_verified) VALUES ('admin', $1, 'admin', true) ON CONFLICT (username) DO UPDATE SET password_hash = $1",
        [hash]
    );
}).then(() => {
    console.log('Admin seeded successfully');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
