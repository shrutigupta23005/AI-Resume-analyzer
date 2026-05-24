// =============================================================
// Rate Limiter Middleware
// Prevents API abuse with different limits per route type
// =============================================================
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth routes rate limiter (stricter)
 * 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login/signup attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI routes rate limiter (strictest - API costs)
 * 15 requests per 15 minutes per IP
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
