/**
 * Контроллер для работы с заявками
 */

const Application = require('../models/Application');

/**
 * Получить все заявки
 */
async function getAll(req, res, next) {
  try {
    const applications = await Application.findAll(req.query);
    res.json(applications);
  } catch (error) {
    next(error);
  }
}

/**
 * Создать заявку
 */
async function create(req, res, next) {
  try {
    const applicationId = await Application.create(req.body);
    res.json({ id: applicationId, message: 'Заявка успешно отправлена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновить статус заявки
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Application.updateStatus(parseInt(id), status);
    res.json({ message: 'Статус заявки обновлен' });
  } catch (error) {
    next(error);
  }
}

/**
 * Экспорт заявок в CSV
 */
async function exportToCSV(req, res, next) {
  try {
    const applications = await Application.findAll(req.query);

    if (req.query.format === 'csv') {
      const headers = ['ID', 'Имя', 'Телефон', 'Email', 'Направление', 'Сообщение', 'Тур', 'Статус', 'Дата создания'];
      const rows = applications.map(app => [
        app.id,
        app.name,
        app.phone,
        app.email || '',
        app.direction || '',
        (app.message || '').replace(/"/g, '""'),
        app.tour_title || '',
        app.status,
        app.created_at
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=applications-${Date.now()}.csv`);
      res.send('\ufeff' + csv); // BOM для правильного отображения кириллицы в Excel
    } else {
      res.json(applications);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  create,
  updateStatus,
  exportToCSV
};

