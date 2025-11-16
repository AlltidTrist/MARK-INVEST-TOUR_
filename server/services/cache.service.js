/**
 * Сервис кэширования с использованием Redis
 * @module services/cache.service
 */

const { getRedisClient, isRedisConnected } = require('../config/redis');
const { log, error, debug } = require('../utils/logger');

/**
 * Префиксы для разных типов кэша
 */
const CACHE_PREFIXES = {
  TOURS: 'tours:',
  TOUR: 'tour:',
  TOUR_IMAGES: 'tour_images:',
  STATS: 'stats:',
  ANALYTICS: 'analytics:'
};

/**
 * Время жизни кэша (TTL) в секундах
 */
const CACHE_TTL = {
  TOURS_LIST: 300,        // 5 минут для списка туров
  TOUR_DETAIL: 600,       // 10 минут для детальной информации о туре
  TOUR_IMAGES: 1800,      // 30 минут для изображений
  STATS: 60,              // 1 минута для статистики
  ANALYTICS: 300          // 5 минут для аналитики
};

/**
 * Получить значение из кэша
 * @param {string} key - Ключ кэша
 * @returns {Promise<any|null>}
 */
async function get(key) {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (value) {
      debug(`Cache HIT: ${key}`);
      return JSON.parse(value);
    }
    
    debug(`Cache MISS: ${key}`);
    return null;
  } catch (err) {
    error(`Ошибка получения из кэша (${key}):`, err.message);
    return null;
  }
}

/**
 * Сохранить значение в кэш
 * @param {string} key - Ключ кэша
 * @param {any} value - Значение для сохранения
 * @param {number} ttl - Время жизни в секундах (опционально)
 * @returns {Promise<boolean>}
 */
async function set(key, value, ttl = null) {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await client.setEx(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    debug(`Cache SET: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`);
    return true;
  } catch (err) {
    error(`Ошибка сохранения в кэш (${key}):`, err.message);
    return false;
  }
}

/**
 * Удалить значение из кэша
 * @param {string} key - Ключ кэша
 * @returns {Promise<boolean>}
 */
async function del(key) {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const client = getRedisClient();
    await client.del(key);
    debug(`Cache DEL: ${key}`);
    return true;
  } catch (err) {
    error(`Ошибка удаления из кэша (${key}):`, err.message);
    return false;
  }
}

/**
 * Удалить все ключи по паттерну
 * @param {string} pattern - Паттерн для поиска ключей (например, 'tours:*')
 * @returns {Promise<number>} Количество удаленных ключей
 */
async function delByPattern(pattern) {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    const deleted = await client.del(keys);
    log(`Удалено из кэша по паттерну ${pattern}: ${deleted} ключей`);
    return deleted;
  } catch (err) {
    error(`Ошибка удаления по паттерну (${pattern}):`, err.message);
    return 0;
  }
}

/**
 * Получить список туров из кэша
 * @param {string} cacheKey - Уникальный ключ для запроса (на основе query параметров)
 * @returns {Promise<Array|null>}
 */
async function getToursList(cacheKey) {
  return await get(`${CACHE_PREFIXES.TOURS}${cacheKey}`);
}

/**
 * Сохранить список туров в кэш
 * @param {string} cacheKey - Уникальный ключ для запроса
 * @param {Array} tours - Массив туров
 * @returns {Promise<boolean>}
 */
async function setToursList(cacheKey, tours) {
  return await set(
    `${CACHE_PREFIXES.TOURS}${cacheKey}`,
    tours,
    CACHE_TTL.TOURS_LIST
  );
}

/**
 * Получить тур по ID из кэша
 * @param {number} tourId - ID тура
 * @returns {Promise<Object|null>}
 */
async function getTour(tourId) {
  return await get(`${CACHE_PREFIXES.TOUR}${tourId}`);
}

/**
 * Сохранить тур в кэш
 * @param {number} tourId - ID тура
 * @param {Object} tour - Данные тура
 * @returns {Promise<boolean>}
 */
async function setTour(tourId, tour) {
  return await set(
    `${CACHE_PREFIXES.TOUR}${tourId}`,
    tour,
    CACHE_TTL.TOUR_DETAIL
  );
}

/**
 * Инвалидировать кэш тура (удалить из кэша)
 * @param {number} tourId - ID тура
 * @returns {Promise<void>}
 */
async function invalidateTour(tourId) {
  await del(`${CACHE_PREFIXES.TOUR}${tourId}`);
  await del(`${CACHE_PREFIXES.TOUR_IMAGES}${tourId}`);
  // Инвалидируем все списки туров, так как они могли измениться
  await delByPattern(`${CACHE_PREFIXES.TOURS}*`);
  log(`Кэш тура ${tourId} инвалидирован`);
}

/**
 * Инвалидировать весь кэш туров
 * @returns {Promise<void>}
 */
async function invalidateAllTours() {
  await delByPattern(`${CACHE_PREFIXES.TOURS}*`);
  await delByPattern(`${CACHE_PREFIXES.TOUR}*`);
  await delByPattern(`${CACHE_PREFIXES.TOUR_IMAGES}*`);
  log('Весь кэш туров инвалидирован');
}

/**
 * Получить изображения тура из кэша
 * @param {number} tourId - ID тура
 * @returns {Promise<Array|null>}
 */
async function getTourImages(tourId) {
  return await get(`${CACHE_PREFIXES.TOUR_IMAGES}${tourId}`);
}

/**
 * Сохранить изображения тура в кэш
 * @param {number} tourId - ID тура
 * @param {Array} images - Массив изображений
 * @returns {Promise<boolean>}
 */
async function setTourImages(tourId, images) {
  return await set(
    `${CACHE_PREFIXES.TOUR_IMAGES}${tourId}`,
    images,
    CACHE_TTL.TOUR_IMAGES
  );
}

/**
 * Создать ключ кэша для списка туров на основе query параметров
 * @param {Object} query - Query параметры запроса
 * @returns {string}
 */
function createToursListCacheKey(query) {
  const params = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  return params || 'all';
}

module.exports = {
  // Базовые методы
  get,
  set,
  del,
  delByPattern,
  
  // Методы для туров
  getToursList,
  setToursList,
  getTour,
  setTour,
  invalidateTour,
  invalidateAllTours,
  createToursListCacheKey,
  
  // Методы для изображений
  getTourImages,
  setTourImages,
  
  // Константы
  CACHE_PREFIXES,
  CACHE_TTL
};

