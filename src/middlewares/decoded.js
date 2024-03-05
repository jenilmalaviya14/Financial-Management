const jwt = require('jsonwebtoken');

const getDecodeToken = (req) => {
    const token = req.headers['authorization'];

    if (!token) {
        return { success: false, message: 'Token not provided' };
    }

    try {
        const tokenParts = token.split(' ');

        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            throw new Error('Invalid token format');
        }

        const decodedToken = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
        return { success: true, decodedToken };
    } catch (error) {
        console.error('Error decoding token:', error);
        return { success: false, message: 'Invalid token' };
    }
};

module.exports = { getDecodeToken };
