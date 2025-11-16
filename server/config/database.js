/**
 * Конфигурация и инициализация базы данных SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

let db = null;

/**
 * Инициализация подключения к базе данных
 * @returns {Promise<sqlite3.Database>}
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || 'travel.db';
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Ошибка подключения к БД:', err.message);
        reject(err);
      } else {
        logger.log('Подключено к SQLite базе данных:', dbPath);
        createTables()
          .then(() => resolve(db))
          .catch(reject);
      }
    });
  });
}

/**
 * Создание всех необходимых таблиц
 * @returns {Promise<void>}
 */
function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      // Таблица туров
      `CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        image_url TEXT,
        price INTEGER,
        duration TEXT,
        location TEXT,
        date_start TEXT,
        date_end TEXT,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        day INTEGER,
        programm TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Таблица заявок
      `CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        direction TEXT,
        message TEXT,
        tour_id INTEGER,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id)
      )`,
      
      // Таблица программы тура
      `CREATE TABLE IF NOT EXISTS tour_programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_id INTEGER NOT NULL,
        day INTEGER NOT NULL,
        programm TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
      )`,
      
      // Таблица галереи изображений
      `CREATE TABLE IF NOT EXISTS tour_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        image_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
      )`,
      
      // Таблица подписок
      `CREATE TABLE IF NOT EXISTS tour_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email)
      )`,
      
      // Таблица аналитики
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_name TEXT NOT NULL,
        tour_id INTEGER,
        user_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE SET NULL
      )`,
      
      // Таблица администраторов
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    let hasError = false;

    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err && !err.message.includes('duplicate column') && !err.message.includes('already exists')) {
          logger.error(`Ошибка создания таблицы ${index}:`, err.message);
          if (!hasError) {
            hasError = true;
            reject(err);
          }
        }
        
        completed++;
        if (completed === tables.length && !hasError) {
          // Добавляем новые поля в существующую таблицу, если их еще нет
          addColumnsIfNotExists()
            .then(() => createDefaultAdmin())
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  });
}

/**
 * Добавление новых колонок в существующую таблицу tours
 * @returns {Promise<void>}
 */
function addColumnsIfNotExists() {
  return new Promise((resolve) => {
    const columns = [
      { name: 'day', type: 'INTEGER' },
      { name: 'programm', type: 'TEXT' }
    ];

    let completed = 0;
    columns.forEach((column) => {
      db.run(`ALTER TABLE tours ADD COLUMN ${column.name} ${column.type}`, (err) => {
        if (err && !err.message.includes('duplicate column') && !err.message.includes('already exists')) {
          logger.error(`Ошибка добавления поля ${column.name}:`, err.message);
        }
        completed++;
        if (completed === columns.length) {
          resolve();
        }
      });
    });
  });
}

/**
 * Создание дефолтного администратора
 * @returns {Promise<void>}
 */
function createDefaultAdmin() {
  return new Promise((resolve) => {
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      `INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`,
      ['admin', defaultPassword],
      (err) => {
        if (!err) {
          logger.log('Дефолтный админ создан: username=admin, password=admin123');
        }
        resolve();
      }
    );
  });
}

/**
 * Получить экземпляр базы данных
 * @returns {sqlite3.Database}
 */
function getDatabase() {
  if (!db) {
    throw new Error('База данных не инициализирована. Вызовите initDatabase() сначала.');
  }
  return db;
}

module.exports = {
  initDatabase,
  getDatabase
};

