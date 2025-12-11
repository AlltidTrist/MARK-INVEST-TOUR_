/**
 * Общая конфигурация путей для хранения загруженных файлов
 */

const fs = require('fs');
const path = require('path');
const { log, warn } = require('../utils/logger');

const projectRoot = path.join(__dirname, '..', '..');
const defaultImagesPath = path.join(projectRoot, 'assets', 'images');
const renderDiskPath = '/opt/render/project/src/data';

/**
 * Создает директорию, если её нет
 * @param {string} dirPath
 */
function ensureDirExists(dirPath) {
  if (!dirPath) {
    return;
  }

  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    warn(`Не удалось создать директорию ${dirPath}: ${err.message}`);
  }
}

/**
 * Определяет путь для хранения изображений с учетом окружения
 * Приоритет:
 * 1. IMAGES_PATH/UPLOADS_PATH (если заданы явно)
 * 2. Railway Volume (RAILWAY_VOLUME_MOUNT_PATH)
 * 3. Render Disk (совместимость)
 * 4. Локальная директория проекта
 * @returns {string}
 */
function resolveImagesStoragePath() {
  const explicitPath = process.env.IMAGES_PATH || process.env.UPLOADS_PATH;
  if (explicitPath) {
    ensureDirExists(explicitPath);
    log(`Используется внешний путь для изображений: ${explicitPath}`);
    return explicitPath;
  }

  const railwayVolumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.RAILWAY_VOLUME_PATH;
  if (railwayVolumePath && fs.existsSync(railwayVolumePath)) {
    const imagesPath = path.join(railwayVolumePath, 'images');
    ensureDirExists(imagesPath);
    log(`Используется Railway Volume для изображений: ${imagesPath}`);
    return imagesPath;
  }

  if (fs.existsSync(renderDiskPath)) {
    const imagesPath = path.join(renderDiskPath, 'images');
    ensureDirExists(imagesPath);
    log(`Используется Render Disk для изображений: ${imagesPath}`);
    return imagesPath;
  }

  ensureDirExists(defaultImagesPath);
  log(`Используется локальная директория для изображений: ${defaultImagesPath}`);
  return defaultImagesPath;
}

const imagesStoragePath = resolveImagesStoragePath();

module.exports = {
  imagesStoragePath,
  ensureDirExists
};


