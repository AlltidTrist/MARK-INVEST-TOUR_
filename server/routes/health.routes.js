/**
 * Роуты для health checks
 * @module routes/health.routes
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Проверка работоспособности API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API работает нормально
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Время работы сервера в секундах
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [connected, disconnected, unknown]
 *                     memory:
 *                       type: object
 *       503:
 *         description: Проблемы с подключением к БД
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    }
  };

  // Проверка подключения к БД
  try {
    const db = getDatabase();
    await new Promise((resolve, reject) => {
      db.get('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    health.checks.database = 'connected';
  } catch (error) {
    health.checks.database = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;

