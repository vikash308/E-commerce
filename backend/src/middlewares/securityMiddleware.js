const rateLimit = require('express-rate-limit');

// Global Rate Limiter: Max 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Rate Limiter: Max 20 attempts per 15 minutes for security-sensitive paths
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom recursive XSS Sanitizer to strip scripts and tags
const xssSanitizer = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      return val
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script blocks
        .replace(/<\/?[^>]+(>|$)/g, '')                     // Strip general HTML tags
        .trim();
    }
    if (Array.isArray(val)) {
      return val.map(sanitizeValue);
    }
    if (typeof val === 'object' && val !== null) {
      const clean = {};
      for (const key in val) {
        clean[key] = sanitizeValue(val[key]);
      }
      return clean;
    }
    return val;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

module.exports = {
  globalLimiter,
  authLimiter,
  xssSanitizer,
};
