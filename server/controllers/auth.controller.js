/**
 * Контроллер для авторизации
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { ValidationError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Вход в систему
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const admin = await Admin.verifyPassword(username, password);

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить информацию о текущем администраторе
 */
async function getMe(req, res, next) {
  try {
    const admin = await Admin.findById(req.user.id);
    res.json(admin);
  } catch (error) {
    next(error);
  }
}

/**
 * Изменить пароль
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await Admin.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getMe,
  changePassword
};

