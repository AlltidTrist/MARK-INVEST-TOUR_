/**
 * Сервис для оптимизации изображений
 * @module services/image-optimization.service
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

/**
 * Оптимизировать изображение
 * @param {string} inputPath - Путь к исходному изображению
 * @param {Object} options - Опции оптимизации
 * @param {number} [options.width] - Ширина
 * @param {number} [options.height] - Высота
 * @param {number} [options.quality=85] - Качество (1-100)
 * @param {string} [options.format] - Формат (webp, jpeg, png)
 * @returns {Promise<Buffer>} Оптимизированное изображение
 */
async function optimizeImage(inputPath, options = {}) {
  try {
    const {
      width,
      height,
      quality = 85,
      format = 'webp'
    } = options;

    let image = sharp(inputPath);

    // Ресайз если указаны размеры
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Конвертация формата
    switch (format.toLowerCase()) {
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality: Math.floor(quality * 0.9) });
        break;
      default:
        image = image.webp({ quality });
    }

    return await image.toBuffer();
  } catch (error) {
    logger.error('Ошибка оптимизации изображения:', error);
    throw error;
  }
}

/**
 * Создать thumbnail изображения
 * @param {string} inputPath - Путь к исходному изображению
 * @param {number} [size=300] - Размер thumbnail (квадрат)
 * @returns {Promise<Buffer>} Thumbnail
 */
async function createThumbnail(inputPath, size = 300) {
  return optimizeImage(inputPath, {
    width: size,
    height: size,
    quality: 80,
    format: 'webp'
  });
}

/**
 * Генерировать разные размеры изображения
 * @param {string} inputPath - Путь к исходному изображению
 * @param {Array<number>} sizes - Массив размеров (ширина)
 * @returns {Promise<Array<{size: number, buffer: Buffer}>>}
 */
async function generateResponsiveImages(inputPath, sizes = [400, 800, 1200]) {
  const results = [];
  
  for (const size of sizes) {
    try {
      const buffer = await optimizeImage(inputPath, {
        width: size,
        quality: 85,
        format: 'webp'
      });
      results.push({ size, buffer });
    } catch (error) {
      logger.error(`Ошибка генерации размера ${size}:`, error);
    }
  }
  
  return results;
}

/**
 * Получить метаданные изображения
 * @param {string} inputPath - Путь к изображению
 * @returns {Promise<Object>} Метаданные
 */
async function getImageMetadata(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    logger.error('Ошибка получения метаданных:', error);
    throw error;
  }
}

/**
 * Сохранить оптимизированное изображение
 * @param {Buffer} buffer - Буфер изображения
 * @param {string} outputPath - Путь для сохранения
 * @returns {Promise<string>} Путь к сохраненному файлу
 */
async function saveOptimizedImage(buffer, outputPath) {
  try {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, buffer);
    return outputPath;
  } catch (error) {
    logger.error('Ошибка сохранения изображения:', error);
    throw error;
  }
}

module.exports = {
  optimizeImage,
  createThumbnail,
  generateResponsiveImages,
  getImageMetadata,
  saveOptimizedImage
};

