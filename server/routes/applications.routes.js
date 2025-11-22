/**
 * Роуты для работы с заявками
 * @module routes/applications.routes
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateApplicationData } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Получить все заявки
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, processed, rejected]
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateToken, applicationController.getAll);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Создать новую заявку
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       201:
 *         description: Заявка успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', validateApplicationData, applicationController.create);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Получить заявку по ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заявки
 *     responses:
 *       200:
 *         description: Данные заявки
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Заявка не найдена
 */
router.get('/:id', authenticateToken, applicationController.getById);

/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Обновить статус заявки
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заявки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, processed, rejected]
 *     responses:
 *       200:
 *         description: Статус заявки обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Заявка не найдена
 */
router.put('/:id/status', authenticateToken, applicationController.updateStatus);

/**
 * @swagger
 * /applications/export:
 *   get:
 *     summary: Экспорт заявок в CSV
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv]
 *         description: Формат экспорта
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, processed, rejected]
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: CSV файл с заявками
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Не авторизован
 */
router.get('/export', authenticateToken, applicationController.exportToCSV);

module.exports = router;

