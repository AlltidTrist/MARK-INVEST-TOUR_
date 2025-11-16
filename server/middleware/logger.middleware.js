/**
 * Middleware для логирования HTTP запросов
 */

const { logRequest } = require('../utils/logger');

/**
 * Middleware для логирования запросов
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Логируем после завершения ответа
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logRequest(req, res, responseTime);
  });

  next();
}

module.exports = {
  requestLogger
};

