const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Rate limiter for all API routes
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for expensive operations
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        error: 'Too many requests for this resource, please try again later.',
        retryAfter: '15 minutes'
    }
});

module.exports = {
    apiLimiter,
    strictLimiter
};
