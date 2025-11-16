/**
 * Сервис для работы с файлами
 */

const fs = require('fs').promises;
const path = require('path');
const { error } = require('../utils/logger');

class FileService {
  /**
   * Удалить файл изображения (включая thumbnail, если существует)
   * @param {string} filePath - Путь к файлу относительно корня проекта
   * @returns {Promise<void>}
   */
  async deleteImage(filePath) {
    if (!filePath) {
      return;
    }

    try {
      const fullPath = path.join(__dirname, '..', '..', filePath);
      
      // Удаляем основное изображение
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          error('Ошибка удаления изображения:', err.message);
        }
      }

      // Пытаемся удалить thumbnail, если он существует
      const ext = path.extname(fullPath);
      const thumbnailPath = fullPath.replace(ext, '_thumb.webp');
      try {
        await fs.unlink(thumbnailPath);
      } catch (err) {
        // Игнорируем, если thumbnail не существует
        if (err.code !== 'ENOENT') {
          error('Ошибка удаления thumbnail:', err.message);
        }
      }
    } catch (err) {
      error('Ошибка удаления изображения:', err.message);
    }
  }

  /**
   * Удалить несколько файлов
   * @param {Array<string>} filePaths
   * @returns {Promise<void>}
   */
  async deleteImages(filePaths) {
    if (!filePaths || filePaths.length === 0) {
      return;
    }

    await Promise.all(filePaths.map(path => this.deleteImage(path)));
  }
}

module.exports = new FileService();

