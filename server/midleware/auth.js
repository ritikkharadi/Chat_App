const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
    try {
        // Retrieve token from cookies, body, or Authorization header
        const token = req.cookies.token || req.body.token || 
            (req.header("Authorization") && req.header("Authorization").replace("Bearer ", ""));

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token Missing',
            });
        }

        console.log("token", token);

        // Verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;

        console.log('Request User:', req.user);

        next();
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: 'Token is invalid',
        });
    }
};
