/**
 * Роуты для работы с изображениями туров
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { upload } = require('../config/upload');
const { authenticateToken } = require('../middleware/auth.middleware');
const fileService = require('../services/file.service');
const cacheService = require('../services/cache.service');
const { NotFoundError } = require('../utils/errors');

/**
 * Получить изображения тура
 */
async function getTourImages(req, res, next) {
  try {
    const { id } = req.params;
    const tourId = parseInt(id);
    
    // Пытаемся получить из кэша
    const cached = await cacheService.getTourImages(tourId);
    if (cached !== null) {
      return res.json(cached);
    }
    
    // Если нет в кэше, получаем из БД
    const db = getDatabase();
    db.all(
      'SELECT * FROM tour_images WHERE tour_id = ? ORDER BY image_order ASC',
      [tourId],
      async (err, images) => {
        if (err) {
          return next(err);
        }
        
        const imagesList = images || [];
        
        // Сохраняем в кэш
        await cacheService.setTourImages(tourId, imagesList);
        
        res.json(imagesList);
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Добавить изображение к туру
 */
async function addTourImage(req, res, next) {
  try {
    const { id } = req.params;
    const tourId = parseInt(id);
    
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    // Оптимизируем изображение галереи
    const imageService = require('../services/image.service');
    const path = require('path');
    const optimizedPath = await imageService.optimizeGalleryImage(req.file.path);
    const image_url = `/assets/images/${path.basename(optimizedPath)}`;
    const image_order = req.body.order || 0;

    const db = getDatabase();
    db.run(
      'INSERT INTO tour_images (tour_id, image_url, image_order) VALUES (?, ?, ?)',
      [tourId, image_url, image_order],
      async (err) => {
        if (err) {
          return next(err);
        }
        
        // Инвалидируем кэш изображений этого тура
        await cacheService.del(`${cacheService.CACHE_PREFIXES.TOUR_IMAGES}${tourId}`);
        
        res.json({ id: this.lastID, image_url, message: 'Изображение добавлено' });
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Удалить изображение из галереи
 */
async function deleteTourImage(req, res, next) {
  try {
    const { imageId } = req.params;
    const db = getDatabase();

    db.get('SELECT tour_id, image_url FROM tour_images WHERE id = ?', [imageId], async (err, image) => {
      if (err) {
        return next(err);
      }
      if (!image) {
        return next(new NotFoundError('Изображение не найдено'));
      }

      const tourId = image.tour_id;

      // Удаляем файл
      await fileService.deleteImage(image.image_url);

      // Удаляем запись из БД
      db.run('DELETE FROM tour_images WHERE id = ?', [imageId], async function(err) {
        if (err) {
          return next(err);
        }
        
        // Инвалидируем кэш изображений этого тура
        await cacheService.del(`${cacheService.CACHE_PREFIXES.TOUR_IMAGES}${tourId}`);
        
        res.json({ message: 'Изображение удалено' });
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /tours/{id}/images:
 *   get:
 *     summary: Получить изображения тура
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тура
 *     responses:
 *       200:
 *         description: Список изображений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TourImage'
 */
router.get('/:id/images', getTourImages);

/**
 * @swagger
 * /tours/{id}/images:
 *   post:
 *     summary: Добавить изображение к туру
 *     tags: [Images]
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
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               order:
 *                 type: integer
 *                 description: Порядок отображения
 *     responses:
 *       200:
 *         description: Изображение добавлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 image_url:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       400:
 *         description: Изображение не загружено
 */
router.post('/:id/images', authenticateToken, upload.single('image'), addTourImage);

/**
 * @swagger
 * /tours/images/{imageId}:
 *   delete:
 *     summary: Удалить изображение из галереи
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID изображения
 *     responses:
 *       200:
 *         description: Изображение удалено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Изображение не найдено
 */
router.delete('/images/:imageId', authenticateToken, deleteTourImage);

module.exports = router;

