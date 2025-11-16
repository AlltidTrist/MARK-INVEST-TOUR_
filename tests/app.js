/**
 * Создание тестового приложения для тестов
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Минимальная настройка для тестов
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Импортируем роуты
const apiRoutes = require('../server/routes');
app.use('/api', apiRoutes);

// Error handler
const { errorHandler, notFoundHandler } = require('../server/middleware/error.middleware');
app.use(errorHandler);
app.use(notFoundHandler);

module.exports = app;

