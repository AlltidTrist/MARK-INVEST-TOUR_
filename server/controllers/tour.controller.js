/**
 * Контроллер для работы с турами
 * @module controllers/tour.controller
 */

const tourService = require('../services/tour.service');
const cacheService = require('../services/cache.service');
const { upload } = require('../config/upload');
const path = require('path');

/**
 * Получить все туры
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query параметры (status, search, dateFrom, dateTo, location, minPrice, maxPrice)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {Promise<void>}
 */
async function getAll(req, res, next) {
  try {
    // Создаем ключ кэша на основе query параметров
    const cacheKey = cacheService.createToursListCacheKey(req.query);
    
    // Пытаемся получить из кэша
    const cached = await cacheService.getToursList(cacheKey);
    if (cached !== null) {
      return res.json(cached);
    }
    
    // Если нет в кэше, получаем из БД
    const tours = await tourService.findAll(req.query);
    
    // Сохраняем в кэш
    await cacheService.setToursList(cacheKey, tours);
    
    res.json(tours);
  } catch (error) {
    next(error);
  }
}

/**
 * Получить один тур по ID
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route параметры
 * @param {string} req.params.id - ID тура
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {Promise<void>}
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const tourId = parseInt(id);
    
    // Пытаемся получить из кэша
    const cached = await cacheService.getTour(tourId);
    if (cached !== null) {
      return res.json(cached);
    }
    
    // Если нет в кэше, получаем из БД
    const tour = await tourService.findById(tourId);
    
    // Сохраняем в кэш
    await cacheService.setTour(tourId, tour);
    
    res.json(tour);
  } catch (error) {
    next(error);
  }
}

/**
 * Создать новый тур
 * @param {Object} req - Express request object
 * @param {Object} req.body - Данные тура
 * @param {Object} req.file - Загруженное изображение (multer)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {Promise<void>}
 */
async function create(req, res, next) {
  try {
    let imageUrl = null;
    
    // Обрабатываем основное изображение тура
    if (req.files && Array.isArray(req.files)) {
      const mainImage = req.files.find(f => f.fieldname === 'image');
      if (mainImage) {
        const imageService = require('../services/image.service');
        const result = await imageService.optimizeTourImage(mainImage.path);
        imageUrl = `/assets/images/${path.basename(result.optimizedPath)}`;
      }
    }
    
    // Обрабатываем изображения программы, если они есть
    const programImages = await processProgramImages(req.files);
    
    const tourId = await tourService.create(req.body, imageUrl, programImages);
    
    // Инвалидируем кэш списков туров
    await cacheService.invalidateAllTours();
    
    res.json({ id: tourId, message: 'Тур успешно создан' });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновить существующий тур
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route параметры
 * @param {string} req.params.id - ID тура
 * @param {Object} req.body - Данные для обновления
 * @param {Object} req.file - Загруженное изображение (multer, опционально)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {Promise<void>}
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const tourId = parseInt(id);
    let imageUrl = null;
    
    // Обрабатываем основное изображение тура
    if (req.files && Array.isArray(req.files)) {
      const mainImage = req.files.find(f => f.fieldname === 'image');
      if (mainImage) {
        const imageService = require('../services/image.service');
        const result = await imageService.optimizeTourImage(mainImage.path);
        imageUrl = `/assets/images/${path.basename(result.optimizedPath)}`;
      }
    }
    
    // Обрабатываем изображения программы, если они есть
    const programImages = await processProgramImages(req.files);
    
    await tourService.update(tourId, req.body, imageUrl, programImages);
    
    // Инвалидируем кэш этого тура и всех списков
    await cacheService.invalidateTour(tourId);
    
    res.json({ message: 'Тур успешно обновлен' });
  } catch (error) {
    next(error);
  }
}

/**
 * Обработать загруженные изображения программы
 * @param {Array} files - Массив файлов от multer
 * @returns {Promise<Object>} Объект с маппингом dayIndex -> imageUrl
 */
async function processProgramImages(files) {
  if (!files || !Array.isArray(files)) {
    return {};
  }
  
  const imageService = require('../services/image.service');
  const programImages = {};
  
  for (const file of files) {
    // Имя поля должно быть в формате programImage_<dayIndex>
    const match = file.fieldname && file.fieldname.match(/programImage_(\d+)/);
    if (match) {
      const dayIndex = match[1];
      try {
        const result = await imageService.optimizeTourImage(file.path);
        programImages[dayIndex] = `/assets/images/${path.basename(result.optimizedPath)}`;
      } catch (error) {
        console.error(`Ошибка обработки изображения для дня ${dayIndex}:`, error);
      }
    }
  }
  
  return programImages;
}

/**
 * Удалить тур
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route параметры
 * @param {string} req.params.id - ID тура
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {Promise<void>}
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const tourId = parseInt(id);
    
    await tourService.delete(tourId);
    
    // Инвалидируем кэш этого тура и всех списков
    await cacheService.invalidateTour(tourId);
    
    res.json({ message: 'Тур успешно удален' });
  } catch (error) {
    next(error);
  }
}

// Middleware для загрузки файла (основное изображение + изображения программы)
// Используем any() для поддержки динамических имен полей
const uploadMiddleware = upload.any();

module.exports = {
  getAll,
  getById,
  create: [uploadMiddleware, create],
  update: [uploadMiddleware, update],
  remove
};

