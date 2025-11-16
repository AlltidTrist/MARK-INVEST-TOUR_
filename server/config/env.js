/**
 * Валидация переменных окружения
 * @module config/env
 */

require('dotenv').config();
const { error } = require('../utils/logger');

/**
 * Валидация обязательных переменных окружения
 */
function validateEnv() {
  const required = {
    JWT_SECRET: {
      value: process.env.JWT_SECRET,
      minLength: 32,
      message: 'JWT_SECRET должен быть минимум 32 символа'
    }
  };

  const missing = [];
  const invalid = [];

  // Проверка наличия обязательных переменных
  Object.keys(required).forEach(key => {
    const config = required[key];
    if (!config.value) {
      missing.push(key);
    } else if (config.minLength && config.value.length < config.minLength) {
      invalid.push({ key, message: config.message });
    }
  });

  // Вывод ошибок
  if (missing.length > 0) {
    error('❌ Отсутствуют обязательные переменные окружения:', missing.join(', '));
    error('Создайте файл .env на основе .env.example');
    process.exit(1);
  }

  if (invalid.length > 0) {
    invalid.forEach(({ key, message }) => {
      error(`❌ ${key}: ${message}`);
    });
    process.exit(1);
  }

  // Предупреждения для development
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.JWT_SECRET === 'your-secret-key-change-in-production-min-32-chars') {
      error('⚠️  ВНИМАНИЕ: Используется дефолтный JWT_SECRET! Измените его в production!');
    }
  }

  // Проверка production настроек
  if (process.env.NODE_ENV === 'production') {
    const productionWarnings = [];
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      productionWarnings.push('SMTP настройки не заданы - email уведомления не будут работать');
    }

    if (process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN) {
      productionWarnings.push('CORS_ORIGIN установлен в "*" - это небезопасно для production');
    }

    if (productionWarnings.length > 0) {
      productionWarnings.forEach(warning => error(`⚠️  ${warning}`));
    }
  }
}

/**
 * Получить значение переменной окружения с дефолтом
 * @param {string} key - Ключ переменной
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any}
 */
function getEnv(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

/**
 * Получить значение переменной окружения как число
 * @param {string} key - Ключ переменной
 * @param {number} defaultValue - Значение по умолчанию
 * @returns {number}
 */
function getEnvNumber(key, defaultValue = 0) {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

/**
 * Получить значение переменной окружения как boolean
 * @param {string} key - Ключ переменной
 * @param {boolean} defaultValue - Значение по умолчанию
 * @returns {boolean}
 */
function getEnvBoolean(key, defaultValue = false) {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

module.exports = {
  validateEnv,
  getEnv,
  getEnvNumber,
  getEnvBoolean
};

