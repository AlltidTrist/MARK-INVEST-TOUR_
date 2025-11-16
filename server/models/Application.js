/**
 * Модель заявки
 */

const { getDatabase } = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');

class Application {
  /**
   * Найти все заявки
   * @param {Object} filters - Фильтры
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const db = getDatabase();
    const { status } = filters;
    
    const query = status
      ? `SELECT a.*, t.title as tour_title FROM applications a 
         LEFT JOIN tours t ON a.tour_id = t.id WHERE a.status = ? ORDER BY a.created_at DESC`
      : `SELECT a.*, t.title as tour_title FROM applications a 
         LEFT JOIN tours t ON a.tour_id = t.id ORDER BY a.created_at DESC`;
    const params = status ? [status] : [];

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, applications) => {
        if (err) reject(err);
        else resolve(applications || []);
      });
    });
  }

  /**
   * Создать новую заявку
   * @param {Object} applicationData
   * @returns {Promise<number>} ID созданной заявки
   */
  static async create(applicationData) {
    const { name, phone, email, direction, message, tour_id } = applicationData;

    if (!name || !phone) {
      throw new ValidationError('Имя и телефон обязательны');
    }

    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO applications (name, phone, email, direction, message, tour_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, phone, email || null, direction || null, message || null, tour_id || null],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Обновить статус заявки
   * @param {number} id
   * @param {string} status
   * @returns {Promise<void>}
   */
  static async updateStatus(id, status) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run('UPDATE applications SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new NotFoundError('Заявка не найдена'));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Получить статистику заявок по дням
   * @param {Date} startDate
   * @returns {Promise<Array>}
   */
  static async getStatsByDay(startDate) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM applications
        WHERE created_at >= ?
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
}

module.exports = Application;

