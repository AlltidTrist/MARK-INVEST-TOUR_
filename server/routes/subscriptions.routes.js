/**
 * Роуты для работы с подписками
 * @module routes/subscriptions.routes
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateSubscriptionData } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Подписаться на уведомления о новых турах
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Успешная подписка
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       400:
 *         description: Ошибка валидации или email уже подписан
 */
router.post('/', validateSubscriptionData, subscriptionController.subscribe);

/**
 * @swagger
 * /subscriptions/unsubscribe:
 *   post:
 *     summary: Отписаться от уведомлений
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Успешная отписка
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 */
router.post('/unsubscribe', validateSubscriptionData, subscriptionController.unsubscribe);

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Получить список всех подписчиков
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список подписчиков
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateToken, subscriptionController.getAll);

/**
 * @swagger
 * /subscriptions/test-email/{tourId}:
 *   post:
 *     summary: Отправить тестовое email уведомление о туре
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тура
 *     responses:
 *       200:
 *         description: Тестовое письмо отправлено
 *       401:
 *         description: Не авторизован
 */
router.post('/test-email/:tourId', authenticateToken, subscriptionController.testEmail);

/**
 * @swagger
 * /subscriptions/test-smtp:
 *   get:
 *     summary: Проверить подключение к SMTP серверу
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Результат проверки SMTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Не авторизован
 */
router.get('/test-smtp', authenticateToken, subscriptionController.testSMTP);

module.exports = router;

