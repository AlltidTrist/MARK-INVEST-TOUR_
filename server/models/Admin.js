/**
 * Модель администратора
 */

const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { NotFoundError, ValidationError } = require('../utils/errors');

class Admin {
  /**
   * Найти администратора по username
   * @param {string} username
   * @returns {Promise<Object>}
   */
  static async findByUsername(username) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
        if (err) reject(err);
        else resolve(admin || null);
      });
    });
  }

  /**
   * Найти администратора по ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async findById(id) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, created_at FROM admins WHERE id = ?', [id], (err, admin) => {
        if (err) {
          reject(err);
        } else if (!admin) {
          reject(new NotFoundError('Администратор не найден'));
        } else {
          resolve(admin);
        }
      });
    });
  }

  /**
   * Проверить пароль администратора
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} Данные администратора при успешной проверке
   */
  static async verifyPassword(username, password) {
    const admin = await this.findByUsername(username);

    if (!admin) {
      throw new ValidationError('Неверный логин или пароль');
    }

    if (!bcrypt.compareSync(password, admin.password)) {
      throw new ValidationError('Неверный логин или пароль');
    }

    return {
      id: admin.id,
      username: admin.username
    };
  }

  /**
   * Изменить пароль администратора
   * @param {number} id
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  static async changePassword(id, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Текущий и новый пароль обязательны');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('Новый пароль должен содержать минимум 6 символов');
    }

    const db = getDatabase();

    return new Promise((resolve, reject) => {
      // Проверяем текущий пароль
      db.get('SELECT * FROM admins WHERE id = ?', [id], (err, admin) => {
        if (err) {
          reject(err);
        } else if (!admin) {
          reject(new NotFoundError('Администратор не найден'));
        } else if (!bcrypt.compareSync(currentPassword, admin.password)) {
          reject(new ValidationError('Неверный текущий пароль'));
        } else {
          // Хешируем новый пароль
          const hashedPassword = bcrypt.hashSync(newPassword, 10);

          // Обновляем пароль
          db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, id], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }
}

module.exports = Admin;

