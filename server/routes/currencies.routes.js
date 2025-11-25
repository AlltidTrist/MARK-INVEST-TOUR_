/**
 * Роуты для работы с курсами валют
 * @module routes/currencies.routes
 */

const express = require('express');
const router = express.Router();

/**
 * Получить курсы валют
 * @swagger
 * /currencies:
 *   get:
 *     summary: Получить курсы валют (USD и EUR к RUB)
 *     tags: [Currencies]
 *     responses:
 *       200:
 *         description: Курсы валют
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     usd:
 *                       type: number
 *                       description: Курс USD к RUB
 *                     eur:
 *                       type: number
 *                       description: Курс EUR к RUB
 */
router.get('/', async (req, res, next) => {
  try {
    // Получаем курсы валют с внешнего API
    // Используем бесплатный API exchangerate-api.com или другой источник
    let usdRate = null;
    let eurRate = null;
    
    try {
      // Попытка получить курсы с exchangerate-api.com (бесплатно до 1500 запросов/месяц)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
      
      if (response.ok) {
        const data = await response.json();
        // Курсы возвращаются как RUB к валюте, нам нужно наоборот
        if (data.rates && data.rates.USD && data.rates.EUR) {
          usdRate = 1 / data.rates.USD; // Конвертируем в RUB за 1 USD
          eurRate = 1 / data.rates.EUR; // Конвертируем в RUB за 1 EUR
        }
      }
    } catch (err) {
      console.warn('Ошибка получения курсов с exchangerate-api.com:', err.message);
    }
    
    // Если не получили курсы, используем значения по умолчанию или из переменных окружения
    if (!usdRate) {
      usdRate = parseFloat(process.env.DEFAULT_USD_RATE) || 95.0;
    }
    if (!eurRate) {
      eurRate = parseFloat(process.env.DEFAULT_EUR_RATE) || 105.0;
    }
    
    res.json({
      success: true,
      data: {
        usd: Math.round(usdRate * 100) / 100, // Округляем до 2 знаков
        eur: Math.round(eurRate * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

