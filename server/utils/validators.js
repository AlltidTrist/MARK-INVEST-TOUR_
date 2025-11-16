/**
 * Утилиты для валидации данных
 * @module utils/validators
 */

const { ValidationError } = require('./errors');

/**
 * Валидация email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Валидация тура
 * @param {Object} tourData
 * @throws {ValidationError}
 */
function validateTour(tourData) {
  if (!tourData.title || tourData.title.trim().length === 0) {
    throw new ValidationError('Название тура обязательно');
  }

  if (tourData.price !== undefined && tourData.price !== null) {
    const price = parseInt(tourData.price);
    if (isNaN(price) || price < 0) {
      throw new ValidationError('Цена должна быть положительным числом');
    }
  }

  if (tourData.date_start && tourData.date_end) {
    const startDate = new Date(tourData.date_start);
    const endDate = new Date(tourData.date_end);
    if (startDate > endDate) {
      throw new ValidationError('Дата начала не может быть позже даты окончания');
    }
  }
}

/**
 * Валидация заявки
 * @param {Object} applicationData
 * @throws {ValidationError}
 */
function validateApplication(applicationData) {
  if (!applicationData.name || applicationData.name.trim().length === 0) {
    throw new ValidationError('Имя обязательно');
  }

  if (!applicationData.phone || applicationData.phone.trim().length === 0) {
    throw new ValidationError('Телефон обязателен');
  }

  if (applicationData.email && !isValidEmail(applicationData.email)) {
    throw new ValidationError('Некорректный email');
  }
}

/**
 * Валидация подписки
 * @param {Object} subscriptionData
 * @throws {ValidationError}
 */
function validateSubscription(subscriptionData) {
  if (!subscriptionData.email) {
    throw new ValidationError('Email обязателен');
  }

  if (!isValidEmail(subscriptionData.email)) {
    throw new ValidationError('Некорректный email');
  }
}

/**
 * Валидация авторизации
 * @param {Object} authData
 * @throws {ValidationError}
 */
function validateAuth(authData) {
  if (!authData.username || authData.username.trim().length === 0) {
    throw new ValidationError('Логин обязателен');
  }

  if (!authData.password || authData.password.trim().length === 0) {
    throw new ValidationError('Пароль обязателен');
  }
}

/**
 * Валидация изменения пароля
 * @param {Object} passwordData
 * @throws {ValidationError}
 */
function validatePasswordChange(passwordData) {
  if (!passwordData.currentPassword) {
    throw new ValidationError('Текущий пароль обязателен');
  }

  if (!passwordData.newPassword) {
    throw new ValidationError('Новый пароль обязателен');
  }

  if (passwordData.newPassword.length < 6) {
    throw new ValidationError('Новый пароль должен содержать минимум 6 символов');
  }
}

/**
 * Валидация события аналитики
 * @param {Object} eventData
 * @throws {ValidationError}
 */
function validateAnalyticsEvent(eventData) {
  if (!eventData.event_type || eventData.event_type.trim().length === 0) {
    throw new ValidationError('event_type обязателен');
  }

  if (!eventData.event_name || eventData.event_name.trim().length === 0) {
    throw new ValidationError('event_name обязателен');
  }
}

module.exports = {
  isValidEmail,
  validateTour,
  validateApplication,
  validateSubscription,
  validateAuth,
  validatePasswordChange,
  validateAnalyticsEvent
};

