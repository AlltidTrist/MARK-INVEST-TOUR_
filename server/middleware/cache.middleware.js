/**
 * Middleware для кэширования ответов API
 * @module middleware/cache.middleware
 */

const cacheService = require('../services/cache.service');
const { debug } = require('../utils/logger');

/**
 * Middleware для кэширования GET запросов
 * Проверяет кэш перед выполнением контроллера и сохраняет результат после
 * @param {Object} options - Опции кэширования
 * @param {string} options.keyGenerator - Функция для генерации ключа кэша из запроса
 * @param {number} options.ttl - Время жизни кэша в секундах
 * @returns {Function} Express middleware
 */
function cacheMiddleware(options = {}) {
  const {
    keyGenerator = (req) => req.originalUrl || req.url,
    ttl = null
  } = options;

  return async (req, res, next) => {
    // Кэшируем только GET запросы
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Пытаемся получить из кэша
      const cached = await cacheService.get(cacheKey);
      
      if (cached !== null) {
        debug(`Cache HIT for ${req.originalUrl}`);
        return res.json(cached);
      }

      // Если нет в кэше, сохраняем оригинальный метод res.json
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Сохраняем в кэш перед отправкой ответа
        cacheService.set(cacheKey, data, ttl).catch(err => {
          debug(`Ошибка сохранения в кэш: ${err.message}`);
        });
        
        // Вызываем оригинальный метод
        return originalJson(data);
      };

      next();
    } catch (err) {
      // В случае ошибки просто пропускаем кэширование
      debug(`Ошибка кэширования: ${err.message}`);
      next();
    }
  };
}

/**
 * Middleware для кэширования списка туров
 */
function cacheToursList() {
  return cacheMiddleware({
    keyGenerator: (req) => {
      const cacheKey = cacheService.createToursListCacheKey(req.query);
      return `tours:${cacheKey}`;
    },
    ttl: cacheService.CACHE_TTL.TOURS_LIST
  });
}

/**
 * Middleware для кэширования одного тура
 */
function cacheTour() {
  return cacheMiddleware({
    keyGenerator: (req) => `tour:${req.params.id}`,
    ttl: cacheService.CACHE_TTL.TOUR_DETAIL
  });
}

/**
 * Middleware для кэширования изображений тура
 */
function cacheTourImages() {
  return cacheMiddleware({
    keyGenerator: (req) => `tour_images:${req.params.id}`,
    ttl: cacheService.CACHE_TTL.TOUR_IMAGES
  });
}

module.exports = {
  cacheMiddleware,
  cacheToursList,
  cacheTour,
  cacheTourImages
};

