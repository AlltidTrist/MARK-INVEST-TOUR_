/**
 * Сервис для оптимизации изображений
 * Использует Sharp для ресайза, конвертации в WebP и создания thumbnails
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { log, error, warn } = require('../utils/logger');

// Проверяем доступность Sharp
let sharpAvailable = false;
try {
  require.resolve('sharp');
  sharpAvailable = true;
} catch (err) {
  warn('Sharp не установлен - оптимизация изображений отключена');
}

/**
 * Оптимизировать изображение тура (основное изображение)
 * @param {string} filePath - Полный путь к файлу
 * @returns {Promise<{originalPath: string, optimizedPath: string, thumbnailPath: string}>}
 */
async function optimizeTourImage(filePath) {
  if (!sharpAvailable) {
    return {
      originalPath: filePath,
      optimizedPath: filePath,
      thumbnailPath: null
    };
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const name = path.basename(filePath, ext);

    // Проверяем, что это изображение
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return {
        originalPath: filePath,
        optimizedPath: filePath,
        thumbnailPath: null
      };
    }

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Оптимизированное изображение: максимум 1920px по ширине, качество 85%
    const optimizedPath = path.join(dir, `${name}.webp`);
    await image
      .resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 85, effort: 4 })
      .toFile(optimizedPath);

    log(`Изображение оптимизировано: ${optimizedPath} (${metadata.width}x${metadata.height} -> до 1920px)`);

    // Thumbnail: 400x400px для карточек туров
    const thumbnailPath = path.join(dir, `${name}_thumb.webp`);
    await sharp(filePath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(thumbnailPath);

    log(`Thumbnail создан: ${thumbnailPath}`);

    // Удаляем оригинал, если он не WebP (чтобы не дублировать)
    if (ext !== '.webp') {
      try {
        await fs.unlink(filePath);
        log(`Оригинальный файл удален: ${filePath}`);
      } catch (err) {
        warn(`Не удалось удалить оригинал ${filePath}:`, err.message);
      }
    }

    return {
      originalPath: ext === '.webp' ? filePath : optimizedPath,
      optimizedPath,
      thumbnailPath
    };
  } catch (err) {
    error('Ошибка оптимизации изображения тура:', err);
    // В случае ошибки возвращаем оригинал
    return {
      originalPath: filePath,
      optimizedPath: filePath,
      thumbnailPath: null
    };
  }
}

/**
 * Оптимизировать изображение галереи
 * @param {string} filePath - Полный путь к файлу
 * @returns {Promise<string>} Путь к оптимизированному файлу
 */
async function optimizeGalleryImage(filePath) {
  if (!sharpAvailable) {
    return filePath;
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const name = path.basename(filePath, ext);

    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return filePath;
    }

    // Галерея: максимум 1200px по ширине, качество 85%
    const optimizedPath = path.join(dir, `${name}.webp`);
    await sharp(filePath)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 85, effort: 4 })
      .toFile(optimizedPath);

    log(`Изображение галереи оптимизировано: ${optimizedPath}`);

    // Удаляем оригинал, если он не WebP
    if (ext !== '.webp') {
      try {
        await fs.unlink(filePath);
        log(`Оригинальный файл галереи удален: ${filePath}`);
      } catch (err) {
        warn(`Не удалось удалить оригинал ${filePath}:`, err.message);
      }
    }

    return optimizedPath;
  } catch (err) {
    error('Ошибка оптимизации изображения галереи:', err);
    return filePath;
  }
}

/**
 * Создать thumbnail из существующего изображения
 * @param {string} imagePath - Путь к исходному изображению (относительно корня проекта)
 * @param {number} width - Ширина thumbnail
 * @param {number} height - Высота thumbnail
 * @returns {Promise<string|null>} Путь к thumbnail или null
 */
async function createThumbnail(imagePath, width = 400, height = 400) {
  if (!sharpAvailable) {
    return null;
  }

  try {
    const fullPath = path.join(__dirname, '..', '..', imagePath);
    const ext = path.extname(fullPath).toLowerCase();
    const dir = path.dirname(fullPath);
    const name = path.basename(fullPath, ext);

    const thumbnailPath = path.join(dir, `${name}_thumb.webp`);
    
    await sharp(fullPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(thumbnailPath);

    const relativeThumbnailPath = imagePath.replace(ext, '_thumb.webp');
    log(`Thumbnail создан: ${relativeThumbnailPath}`);
    
    return relativeThumbnailPath;
  } catch (err) {
    error('Ошибка создания thumbnail:', err);
    return null;
  }
}

/**
 * Получить информацию об изображении
 * @param {string} filePath - Полный путь к файлу
 * @returns {Promise<Object>} Метаданные изображения
 */
async function getImageMetadata(filePath) {
  if (!sharpAvailable) {
    return null;
  }

  try {
    return await sharp(filePath).metadata();
  } catch (err) {
    error('Ошибка получения метаданных изображения:', err);
    return null;
  }
}

module.exports = {
  optimizeTourImage,
  optimizeGalleryImage,
  createThumbnail,
  getImageMetadata,
  sharpAvailable
};

