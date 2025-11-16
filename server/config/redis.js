/**
 * Конфигурация Redis
 * @module config/redis
 */

const redis = require('redis');
const { log, error, warn } = require('../utils/logger');
require('dotenv').config();

let redisClient = null;
let isConnected = false;

/**
 * Инициализация подключения к Redis
 * @returns {Promise<redis.RedisClientType|null>}
 */
async function initRedis() {
  // Если Redis отключен через переменную окружения
  if (process.env.REDIS_ENABLED === 'false') {
    warn('Redis отключен через REDIS_ENABLED=false');
    return null;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            warn('Превышено количество попыток переподключения к Redis');
            return new Error('Превышено количество попыток переподключения');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      error('Redis Client Error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      log('Подключение к Redis...');
    });

    redisClient.on('ready', () => {
      log('Redis готов к работе');
      isConnected = true;
    });

    redisClient.on('end', () => {
      warn('Подключение к Redis закрыто');
      isConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    error('Ошибка подключения к Redis:', err.message);
    warn('Приложение будет работать без кэширования');
    redisClient = null;
    isConnected = false;
    return null;
  }
}

/**
 * Получить клиент Redis
 * @returns {redis.RedisClientType|null}
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Проверить, подключен ли Redis
 * @returns {boolean}
 */
function isRedisConnected() {
  return isConnected && redisClient !== null;
}

/**
 * Закрыть подключение к Redis
 */
async function closeRedis() {
  if (redisClient && isConnected) {
    try {
      await redisClient.quit();
      log('Подключение к Redis закрыто');
    } catch (err) {
      error('Ошибка закрытия подключения к Redis:', err);
    }
  }
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisConnected,
  closeRedis
};

