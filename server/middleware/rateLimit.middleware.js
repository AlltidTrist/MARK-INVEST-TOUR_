/**
 * Middleware для rate limiting
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter для логина
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток
  message: { error: 'Слишком много попыток входа, попробуйте позже через 15 минут' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter для API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter
};

