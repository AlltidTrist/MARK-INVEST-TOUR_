/**
 * Роуты для работы с аналитикой
 * @module routes/analytics.routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateAnalyticsEventData } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /analytics/event:
 *   post:
 *     summary: Создать событие аналитики
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - eventName
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [view, click, submit, download]
 *               eventName:
 *                 type: string
 *               tourId:
 *                 type: integer
 *               userData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Событие записано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       400:
 *         description: Ошибка валидации
 */
router.post('/event', validateAnalyticsEventData, analyticsController.createEvent);

/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     summary: Получить статистику аналитики
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата периода
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата периода
 *     responses:
 *       200:
 *         description: Статистика аналитики
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Не авторизован
 */
router.get('/stats', authenticateToken, analyticsController.getStats);

module.exports = router;

