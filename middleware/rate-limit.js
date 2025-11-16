const rateLimit = require('express-rate-limit');

const createRateLimit = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.API_RATE_LIMIT) || 10,
        message: {
            success: false,
            error: 'Too many requests, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

module.exports = createRateLimit();





