/**
 * Middleware для валидации данных
 */

const {
  validateTour,
  validateApplication,
  validateSubscription,
  validateAuth,
  validatePasswordChange,
  validateAnalyticsEvent
} = require('../utils/validators');

/**
 * Валидация данных тура
 */
function validateTourData(req, res, next) {
  try {
    validateTour(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Валидация данных заявки
 */
function validateApplicationData(req, res, next) {
  try {
    validateApplication(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Валидация данных подписки
 */
function validateSubscriptionData(req, res, next) {
  try {
    validateSubscription(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Валидация данных авторизации
 */
function validateAuthData(req, res, next) {
  try {
    validateAuth(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Валидация изменения пароля
 */
function validatePasswordChangeData(req, res, next) {
  try {
    validatePasswordChange(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Валидация события аналитики
 */
function validateAnalyticsEventData(req, res, next) {
  try {
    validateAnalyticsEvent(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateTourData,
  validateApplicationData,
  validateSubscriptionData,
  validateAuthData,
  validatePasswordChangeData,
  validateAnalyticsEventData
};

