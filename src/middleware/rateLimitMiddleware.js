const rateLimit = require('express-rate-limit')

// General API limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: 'Too many requests, please try again after 15 minutes'
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
})

// Strict limiter for auth routes - 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message: 'Too many auth attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { apiLimiter, authLimiter }