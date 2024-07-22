const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.adminAuth = (req, res, next) => {
    try {
        let token = req.cookies.token || req.body.token || req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        // Check if the token starts with 'Bearer '
        if (token.startsWith('Bearer ')) {
            token = token.slice(7); // Remove 'Bearer ' from the token string
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(400).json({
            success: false,
            message: 'Invalid token.',
        });
    }
};