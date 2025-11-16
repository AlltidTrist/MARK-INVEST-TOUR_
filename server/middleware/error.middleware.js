/**
 * Middleware для централизованной обработки ошибок
 */

const multer = require('multer');
const { error } = require('../utils/logger');
const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
} = require('../utils/errors');

/**
 * Обработчик ошибок
 */
function errorHandler(err, req, res, next) {
  // Ошибки multer (загрузка файлов)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла превышает 5MB' });
    }
    return res.status(400).json({ error: err.message });
  }

  // Ошибки валидации файлов
  if (err.message && err.message.includes('Разрешены только изображения')) {
    return res.status(400).json({ error: err.message });
  }

  // Кастомные ошибки валидации
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  // Ошибки авторизации
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }

  // Ошибки доступа
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message });
  }

  // Ошибки не найдено
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  // Кастомные ошибки с statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Ошибки SQLite
  if (err.code && err.code.startsWith('SQLITE_')) {
    error('Ошибка базы данных:', err);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Ошибка базы данных'
        : err.message
    });
  }

  // Остальные ошибки
  error('Ошибка сервера:', err);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    error('Stack trace:', err.stack);
  }
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Внутренняя ошибка сервера'
      : err.message
  });
}

/**
 * Обработчик 404
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Маршрут не найден' });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

