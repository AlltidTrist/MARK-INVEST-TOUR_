/**
 * Роуты для статистики (используется в админ-панели)
 * @module routes/stats.routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Получить расширенную статистику (для админ-панели)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Период для статистики
 *     responses:
 *       200:
 *         description: Расширенная статистика
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tours:
 *                   type: object
 *                 applications:
 *                   type: object
 *                 analytics:
 *                   type: object
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateToken, analyticsController.getExtendedStats);

module.exports = router;

