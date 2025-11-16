/**
 * Утилита для логирования
 * Использует Winston если доступен, иначе fallback на console
 * @module utils/logger
 */

let winstonLogger = null;

// Пытаемся загрузить Winston logger
try {
  winstonLogger = require('./logger.winston');
} catch (err) {
  // Winston не установлен, используем fallback
}

/**
 * Форматирование времени для логов
 * @returns {string}
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Логирование информации
 * @param {...any} args
 */
function log(...args) {
  if (winstonLogger) {
    winstonLogger.info(...args);
  } else {
    const timestamp = getTimestamp();
    console.log(`[${timestamp}] [INFO]`, ...args);
  }
}

/**
 * Логирование ошибок
 * @param {...any} args
 */
function error(...args) {
  if (winstonLogger) {
    winstonLogger.error(...args);
  } else {
    const timestamp = getTimestamp();
    console.error(`[${timestamp}] [ERROR]`, ...args);
  }
}

/**
 * Логирование предупреждений
 * @param {...any} args
 */
function warn(...args) {
  if (winstonLogger) {
    winstonLogger.warn(...args);
  } else {
    const timestamp = getTimestamp();
    console.warn(`[${timestamp}] [WARN]`, ...args);
  }
}

/**
 * Логирование отладочной информации (только в development)
 * @param {...any} args
 */
function debug(...args) {
  if (process.env.NODE_ENV !== 'production') {
    if (winstonLogger) {
      winstonLogger.debug(...args);
    } else {
      const timestamp = getTimestamp();
      console.log(`[${timestamp}] [DEBUG]`, ...args);
    }
  }
}

/**
 * Логирование HTTP запросов
 * @param {Object} req
 * @param {Object} res
 * @param {number} responseTime
 */
function logRequest(req, res, responseTime) {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const status = res.statusCode;
  const ip = req.ip || req.connection.remoteAddress;
  
  const logData = {
    method,
    url,
    status,
    responseTime,
    ip
  };
  
  if (winstonLogger) {
    if (status >= 500) {
      winstonLogger.error('HTTP Request', logData);
    } else if (status >= 400) {
      winstonLogger.warn('HTTP Request', logData);
    } else {
      winstonLogger.info('HTTP Request', logData);
    }
  } else {
    const message = `${method} ${url} ${status} ${responseTime}ms - ${ip}`;
    if (status >= 500) {
      error(message);
    } else if (status >= 400) {
      warn(message);
    } else {
      log(message);
    }
  }
}

module.exports = {
  log,
  error,
  warn,
  debug,
  logRequest
};

