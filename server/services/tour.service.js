/**
 * Сервис для работы с турами
 */

const Tour = require('../models/Tour');
const Subscription = require('../models/Subscription');
const emailService = require('./email.service');
const fileService = require('./file.service');
const { log } = require('../utils/logger');

class TourService {
  /**
   * Получить все туры с фильтрами
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async findAll(filters) {
    return await Tour.findAll(filters);
  }

  /**
   * Получить тур по ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async findById(id) {
    return await Tour.findById(id);
  }

  /**
   * Создать новый тур
   * @param {Object} tourData
   * @param {string} imageUrl - URL загруженного изображения
   * @param {Object} programImages - Объект с изображениями программы (dayIndex -> imageUrl)
   * @returns {Promise<number>} ID созданного тура
   */
  async create(tourData, imageUrl = null, programImages = {}) {
    const tourWithImage = {
      ...tourData,
      image_url: imageUrl
    };

    const tourId = await Tour.create(tourWithImage);

    // Сохраняем программу тура, если она передана
    if (tourData.programs) {
      let programsArray = [];
      try {
        programsArray = typeof tourData.programs === 'string' 
          ? JSON.parse(tourData.programs) 
          : tourData.programs;
      } catch (e) {
        programsArray = [];
      }

      // Добавляем изображения к программам
      if (programsArray && programsArray.length > 0) {
        programsArray = programsArray.map((program, index) => {
          const dayIndex = program.dayIndex || index.toString();
          return {
            ...program,
            image_url: programImages[dayIndex] || program.image_url || null
          };
        });
        await Tour.savePrograms(tourId, programsArray);
      }
    }

    // Отправляем email уведомления подписчикам (не блокируем ответ)
    this._notifySubscribersAboutNewTour(tourId).catch(err => {
      log('Ошибка отправки email уведомлений:', err);
    });

    return tourId;
  }

  /**
   * Обновить тур
   * @param {number} id
   * @param {Object} tourData
   * @param {string} imageUrl - URL нового изображения (если загружено)
   * @param {Object} programImages - Объект с изображениями программы (dayIndex -> imageUrl)
   * @returns {Promise<void>}
   */
  async update(id, tourData, imageUrl = null, programImages = {}) {
    const updateData = {
      ...tourData,
      ...(imageUrl && { image_url: imageUrl })
    };

    await Tour.update(id, updateData);

    // Обновляем программу тура, если она передана
    if (tourData.programs !== undefined) {
      let programsArray = [];
      try {
        programsArray = typeof tourData.programs === 'string' 
          ? JSON.parse(tourData.programs) 
          : tourData.programs;
      } catch (e) {
        programsArray = [];
      }

      // Добавляем изображения к программам
      if (programsArray && programsArray.length > 0) {
        programsArray = programsArray.map((program, index) => {
          const dayIndex = program.dayIndex || index.toString();
          // Сохраняем существующее изображение, если новое не загружено
          return {
            ...program,
            image_url: programImages[dayIndex] || program.image_url || null
          };
        });
        await Tour.savePrograms(id, programsArray);
      }
    }
  }

  /**
   * Удалить тур
   * @param {number} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const tour = await Tour.delete(id);

    // Удаляем изображение, если оно есть
    if (tour.image_url) {
      await fileService.deleteImage(tour.image_url);
    }
  }

  /**
   * Уведомить подписчиков о новом туре
   * @private
   */
  async _notifySubscribersAboutNewTour(tourId) {
    const tour = await Tour.findById(tourId);
    const subscribers = await Subscription.findActive();

    if (subscribers && subscribers.length > 0) {
      await emailService.sendNewTourEmail(tour, subscribers);
    }
  }
}

module.exports = new TourService();

