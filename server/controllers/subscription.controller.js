/**
 * Контроллер для работы с подписками
 */

const Subscription = require('../models/Subscription');
const Tour = require('../models/Tour');
const emailService = require('../services/email.service');
const { isEmailConfigured } = require('../config/email');

/**
 * Подписаться на уведомления
 */
async function subscribe(req, res, next) {
  try {
    const { email } = req.body;
    await Subscription.subscribe(email);
    res.json({ message: 'Подписка оформлена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Отписаться от уведомлений
 */
async function unsubscribe(req, res, next) {
  try {
    const { email } = req.body;
    await Subscription.unsubscribe(email);
    res.json({ message: 'Отписка выполнена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить список подписчиков
 */
async function getAll(req, res, next) {
  try {
    const subscriptions = await Subscription.findActive();
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
}

/**
 * Тестовая отправка email для конкретного тура
 */
async function testEmail(req, res, next) {
  try {
    const tourId = parseInt(req.params.tourId);

    if (!tourId) {
      return res.status(400).json({ error: 'Некорректный ID тура' });
    }

    const tour = await Tour.findById(tourId);
    const subscribers = await Subscription.findActive();

    if (!subscribers || subscribers.length === 0) {
      return res.status(400).json({
        error: 'Нет активных подписчиков',
        subscribers: 0
      });
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({
        error: 'SMTP не настроен. Проверьте переменные окружения SMTP_USER и SMTP_PASS.',
        subscribers: subscribers.length
      });
    }

    await emailService.sendNewTourEmail(tour, subscribers);

    res.json({
      success: true,
      message: `Отправлено ${subscribers.length} тестовых уведомлений о туре ${tourId}`,
      tour: {
        id: tour.id,
        title: tour.title || tour.location
      },
      subscribers: subscribers.length,
      emails: subscribers.map(s => s.email)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Проверка подключения SMTP
 */
async function testSMTP(req, res, next) {
  try {
    if (!isEmailConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'SMTP не настроен',
        message: 'Проверьте переменные окружения SMTP_USER и SMTP_PASS'
      });
    }

    const isConnected = await emailService.verifyConnection();

    if (isConnected) {
      res.json({
        success: true,
        message: 'SMTP подключение успешно',
        smtp: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          user: process.env.SMTP_USER
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Ошибка подключения к SMTP серверу'
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  getAll,
  testEmail,
  testSMTP
};

