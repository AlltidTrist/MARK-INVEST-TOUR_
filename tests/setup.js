/**
 * Настройка тестового окружения
 */

// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-characters-long';
process.env.DB_PATH = ':memory:'; // Используем in-memory БД для тестов

