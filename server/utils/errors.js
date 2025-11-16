/**
 * Кастомные классы ошибок
 */

/**
 * Ошибка валидации
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * Ошибка авторизации
 */
class UnauthorizedError extends Error {
  constructor(message = 'Не авторизован') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

/**
 * Ошибка доступа запрещен
 */
class ForbiddenError extends Error {
  constructor(message = 'Доступ запрещен') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

/**
 * Ошибка не найдено
 */
class NotFoundError extends Error {
  constructor(message = 'Ресурс не найден') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

module.exports = {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};

