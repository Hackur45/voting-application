const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

const generateJWT = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { jwtAuthMiddleware, generateJWT };