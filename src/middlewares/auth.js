const jwt = require('jsonwebtoken');
const express = require("express");
const User = require('../models/user');
const { getDecodeToken } = require('../middlewares/decoded');
const app = express();

const verifyToken = async (req, res, next) => {
    try {
        const decoded = getDecodeToken(req);

        if (!decoded.success) {
            return res.status(401).json({
                success: false,
                message: decoded.message,
            });
        }

        const [user, _] = await User.findByEmail(decoded.decodedToken.email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        req.user = user[0];
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
            });
        } else {
            console.log(error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }
    }
};

module.exports = { verifyToken };