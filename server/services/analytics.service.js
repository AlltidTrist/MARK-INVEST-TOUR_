/**
 * Сервис для работы с аналитикой
 */

const Analytics = require('../models/Analytics');
const Application = require('../models/Application');
const Tour = require('../models/Tour');
const { getDatabase } = require('../config/database');

class AnalyticsService {
  /**
   * Создать событие аналитики
   * @param {Object} eventData
   * @returns {Promise<number>}
   */
  async createEvent(eventData) {
    return await Analytics.createEvent(eventData);
  }

  /**
   * Получить статистику аналитики
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async getStats(filters) {
    return await Analytics.getStats(filters);
  }

  /**
   * Получить расширенную статистику
   * Оптимизировано: параллельное выполнение запросов
   * @param {number} periodDays - Период в днях
   * @returns {Promise<Object>}
   */
  async getExtendedStats(periodDays = 30) {
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - periodDays);
    const periodDateStr = periodDate.toISOString();

    // Выполняем все запросы параллельно для оптимизации
    const [mainStats, topTours, applicationsByDay, viewsByDay] = await Promise.all([
      this._getMainStats(periodDateStr),
      Analytics.getTopTours(),
      Application.getStatsByDay(periodDate),
      Analytics.getViewsByDay(periodDate)
    ]);

    return {
      ...mainStats,
      top_tours: topTours || [],
      applications_by_day: applicationsByDay || [],
      views_by_day: viewsByDay || []
    };
  }

  /**
   * Получить основную статистику (приватный метод)
   * @private
   * @param {string} periodDateStr
   * @returns {Promise<Object>}
   */
  _getMainStats(periodDateStr) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          (SELECT COUNT(*) FROM tours WHERE status = 'active') as active_tours,
          (SELECT COUNT(*) FROM applications WHERE status = 'new') as new_applications,
          (SELECT COUNT(*) FROM applications) as total_applications,
          (SELECT COUNT(*) FROM tours) as total_tours,
          (SELECT COUNT(*) FROM applications WHERE created_at >= ?) as applications_period,
          (SELECT COUNT(*) FROM tour_subscriptions WHERE status = 'active') as active_subscriptions,
          (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'tour_view' AND created_at >= ?) as tour_views_period,
          (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'form_submit' AND created_at >= ?) as form_submits_period
        `,
        [periodDateStr, periodDateStr, periodDateStr],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0] || {});
          }
        }
      );
    });
  }
}

module.exports = new AnalyticsService();

