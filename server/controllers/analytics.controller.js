/**
 * Контроллер для работы с аналитикой
 */

const analyticsService = require('../services/analytics.service');

/**
 * Создать событие аналитики
 */
async function createEvent(req, res, next) {
  try {
    const eventId = await analyticsService.createEvent(req.body);
    res.json({ id: eventId, message: 'Событие записано' });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить статистику аналитики
 */
async function getStats(req, res, next) {
  try {
    const stats = await analyticsService.getStats(req.query);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * Получить расширенную статистику
 */
async function getExtendedStats(req, res, next) {
  try {
    const { period = '30' } = req.query;
    const stats = await analyticsService.getExtendedStats(parseInt(period));
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEvent,
  getStats,
  getExtendedStats
};

