/**
 * Модель аналитики
 */

const { getDatabase } = require('../config/database');
const { ValidationError } = require('../utils/errors');

class Analytics {
  /**
   * Создать событие аналитики
   * @param {Object} eventData
   * @returns {Promise<number>} ID созданного события
   */
  static async createEvent(eventData) {
    const { event_type, event_name, tour_id, user_data } = eventData;

    if (!event_type || !event_name) {
      throw new ValidationError('event_type и event_name обязательны');
    }

    const db = getDatabase();
    const userDataStr = user_data ? JSON.stringify(user_data) : null;

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO analytics_events (event_type, event_name, tour_id, user_data) VALUES (?, ?, ?, ?)',
        [event_type, event_name, tour_id || null, userDataStr],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Получить статистику аналитики
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async getStats(filters = {}) {
    const db = getDatabase();
    const { startDate, endDate } = filters;

    let query = `
      SELECT 
        event_type,
        event_name,
        COUNT(*) as count,
        COUNT(DISTINCT tour_id) as unique_tours
      FROM analytics_events
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY event_type, event_name ORDER BY count DESC';

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, stats) => {
        if (err) reject(err);
        else resolve(stats || []);
      });
    });
  }

  /**
   * Получить статистику просмотров по дням
   * @param {Date} startDate
   * @returns {Promise<Array>}
   */
  static async getViewsByDay(startDate) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM analytics_events
        WHERE event_name = 'tour_view' AND created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC`,
        [startDate.toISOString()],
        (err, stats) => {
          if (err) reject(err);
          else resolve(stats || []);
        }
      );
    });
  }

  /**
   * Получить топ туров по просмотрам
   * @returns {Promise<Array>}
   */
  static async getTopTours() {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          t.id,
          t.title,
          COUNT(DISTINCT a.id) as applications_count,
          COUNT(DISTINCT ae.id) as views_count
        FROM tours t
        LEFT JOIN applications a ON a.tour_id = t.id
        LEFT JOIN analytics_events ae ON ae.tour_id = t.id AND ae.event_name = 'tour_view'
        WHERE t.status = 'active'
        GROUP BY t.id
        ORDER BY views_count DESC
        LIMIT 10`,
        [],
        (err, tours) => {
          if (err) reject(err);
          else resolve(tours || []);
        }
      );
    });
  }
}

module.exports = Analytics;

