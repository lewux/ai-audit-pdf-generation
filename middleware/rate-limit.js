const rateLimit = require('express-rate-limit');

// General API rate limiter
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

// Strict rate limiter for authentication endpoints
// Prevents brute force attacks on token generation
const createAuthRateLimit = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.AUTH_RATE_LIMIT) || 5, // Stricter: only 5 attempts per 15 minutes
        message: {
            success: false,
            error: 'Too many authentication attempts, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false, // Count all requests, even successful ones
        skipFailedRequests: false
    });
};

module.exports = {
    default: createRateLimit(),
    auth: createAuthRateLimit()
};





