/**
 * Модель подписки
 */

const { getDatabase } = require('../config/database');
const { ValidationError } = require('../utils/errors');

class Subscription {
  /**
   * Найти все активные подписки
   * @returns {Promise<Array>}
   */
  static async findActive() {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM tour_subscriptions WHERE status = ? ORDER BY created_at DESC',
        ['active'],
        (err, subscriptions) => {
          if (err) reject(err);
          else resolve(subscriptions || []);
        }
      );
    });
  }

  /**
   * Создать или обновить подписку
   * @param {string} email
   * @returns {Promise<void>}
   */
  static async subscribe(email) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Некорректный email');
    }

    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO tour_subscriptions (email, status) VALUES (?, ?)',
        [email, 'active'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Отписаться от рассылки
   * @param {string} email
   * @returns {Promise<void>}
   */
  static async unsubscribe(email) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tour_subscriptions SET status = ? WHERE email = ?',
        ['unsubscribed', email],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = Subscription;

