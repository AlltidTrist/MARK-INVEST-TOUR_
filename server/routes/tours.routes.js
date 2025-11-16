/**
 * Роуты для работы с турами
 * @module routes/tours.routes
 */

const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateTourData } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Получить список туров
 *     tags: [Tours]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed, cancelled]
 *         description: Фильтр по статусу
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию или описанию
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Фильтр по местоположению
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Максимальная цена
 *     responses:
 *       200:
 *         description: Список туров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 */
router.get('/', tourController.getAll);

/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Получить тур по ID
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тура
 *     responses:
 *       200:
 *         description: Данные тура
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       404:
 *         description: Тур не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', tourController.getById);

/**
 * @swagger
 * /tours:
 *   post:
 *     summary: Создать новый тур
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               short_description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               location:
 *                 type: string
 *               date_start:
 *                 type: string
 *                 format: date
 *               date_end:
 *                 type: string
 *                 format: date
 *               max_participants:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, completed, cancelled]
 *               image:
 *                 type: string
 *                 format: binary
 *               programs:
 *                 type: string
 *                 description: JSON массив программ тура
 *     responses:
 *       201:
 *         description: Тур успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', authenticateToken, validateTourData, tourController.create);

/**
 * @swagger
 * /tours/{id}:
 *   put:
 *     summary: Обновить тур
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тура
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               short_description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               location:
 *                 type: string
 *               date_start:
 *                 type: string
 *                 format: date
 *               date_end:
 *                 type: string
 *                 format: date
 *               max_participants:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, completed, cancelled]
 *               image:
 *                 type: string
 *                 format: binary
 *               programs:
 *                 type: string
 *                 description: JSON массив программ тура
 *     responses:
 *       200:
 *         description: Тур успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Тур не найден
 */
router.put('/:id', authenticateToken, validateTourData, tourController.update);

/**
 * @swagger
 * /tours/{id}:
 *   delete:
 *     summary: Удалить тур
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тура
 *     responses:
 *       200:
 *         description: Тур успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Тур не найден
 */
router.delete('/:id', authenticateToken, tourController.remove);

module.exports = router;

