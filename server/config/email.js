/**
 * Конфигурация email транспорта (nodemailer)
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Создание email транспорта
 * @returns {nodemailer.Transporter}
 */
function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true для 465, false для других портов
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Проверка настроек SMTP
 * @returns {boolean}
 */
function isEmailConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Получить базовый URL сайта
 * @returns {string}
 */
function getSiteUrl() {
  return process.env.SITE_URL || 'http://localhost:3000';
}

module.exports = {
  createEmailTransporter,
  isEmailConfigured,
  getSiteUrl
};

