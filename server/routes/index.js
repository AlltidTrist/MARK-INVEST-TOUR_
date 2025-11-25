/**
 * Объединение всех роутов
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const tourRoutes = require('./tours.routes');
const applicationRoutes = require('./applications.routes');
const subscriptionRoutes = require('./subscriptions.routes');
const analyticsRoutes = require('./analytics.routes');
const imageRoutes = require('./images.routes');
const healthRoutes = require('./health.routes');
const currenciesRoutes = require('./currencies.routes');

// Health check (публичный, без rate limiting)
router.use('/health', healthRoutes);

// Роуты авторизации
router.use('/auth', authRoutes);

// Роуты изображений туров (должны быть до /tours/:id, чтобы не конфликтовали)
router.use('/tours', imageRoutes);

// Роуты туров
router.use('/tours', tourRoutes);

// Роуты заявок
router.use('/applications', applicationRoutes);

// Роуты подписок
router.use('/subscriptions', subscriptionRoutes);

// Роуты аналитики
router.use('/analytics', analyticsRoutes);

// Роут для расширенной статистики (используется в админ-панели)
router.use('/stats', require('./stats.routes'));

// Роуты курсов валют (публичные)
router.use('/currencies', currenciesRoutes);

module.exports = router;

