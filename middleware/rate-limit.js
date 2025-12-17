const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication endpoints
// Prevents brute force attacks on token generation
// WordPress caches token for 24 hours, so limit remains strict
const createAuthRateLimit = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.AUTH_RATE_LIMIT) || 5, // 5 attempts per 15 minutes
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

// Rate limiter for PDF generation endpoints
// Heavy operation, but sufficient limit needed for request processing
const createPDFGenerationRateLimit = () => {
    return rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: parseInt(process.env.PDF_RATE_LIMIT) || 25, // 25 requests per 10 minutes
        message: {
            success: false,
            error: 'Too many PDF generation requests, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Rate limiter for PDF download endpoints
// Lightweight operation, but using same limit for balance
const createDownloadRateLimit = () => {
    return rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: parseInt(process.env.DOWNLOAD_RATE_LIMIT) || 25, // 25 requests per 10 minutes
        message: {
            success: false,
            error: 'Too many download requests, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// General API rate limiter (for other endpoints like health)
const createGeneralRateLimit = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.API_RATE_LIMIT) || 100, // High limit for health checks
        message: {
            success: false,
            error: 'Too many requests, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

module.exports = {
    auth: createAuthRateLimit(),
    pdf: createPDFGenerationRateLimit(),
    download: createDownloadRateLimit(),
    general: createGeneralRateLimit()
};





