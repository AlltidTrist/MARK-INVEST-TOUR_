/**
 * Сервис для работы с email
 */

const { createEmailTransporter, isEmailConfigured, getSiteUrl } = require('../config/email');
const { log, error } = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = createEmailTransporter();
  }

  /**
   * Отправить email подписчикам о новом туре
   * @param {Object} tour - Данные тура
   * @param {Array} subscribers - Список подписчиков
   * @returns {Promise<void>}
   */
  async sendNewTourEmail(tour, subscribers) {
    if (!isEmailConfigured()) {
      log('Email не настроен. Пропускаем отправку уведомлений.');
      return;
    }

    if (!subscribers || subscribers.length === 0) {
      return;
    }

    const siteUrl = getSiteUrl();
    const tourUrl = `${siteUrl}/tour/${tour.id}`;
    const tourImage = tour.image_url ? `${siteUrl}${tour.image_url}` : '';

    const emailHtml = this._generateTourEmailHtml(tour, tourUrl, tourImage);
    const emailText = this._generateTourEmailText(tour, tourUrl);

    // Отправляем письма всем подписчикам
    const emailPromises = subscribers.map(subscriber => {
      const personalizedHtml = emailHtml.replace(/{email}/g, encodeURIComponent(subscriber.email));
      const personalizedText = emailText.replace(/{email}/g, encodeURIComponent(subscriber.email));

      return this.transporter.sendMail({
        from: `"MARK INVEST TOUR" <${process.env.SMTP_USER}>`,
        to: subscriber.email,
        subject: `Новый тур: ${tour.title || tour.location}`,
        html: personalizedHtml,
        text: personalizedText
      }).catch(err => {
        error(`Ошибка отправки email на ${subscriber.email}:`, err);
      });
    });

    try {
      await Promise.all(emailPromises);
      log(`Отправлено ${subscribers.length} уведомлений о новом туре ${tour.id}`);
    } catch (err) {
      error('Ошибка при отправке email уведомлений:', err);
    }
  }

  /**
   * Проверить подключение SMTP
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    if (!isEmailConfigured()) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      error('Ошибка проверки SMTP:', err);
      return false;
    }
  }

  /**
   * Генерация HTML шаблона письма о новом туре
   * @private
   */
  _generateTourEmailHtml(tour, tourUrl, tourImage) {
    const siteUrl = getSiteUrl();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Новый тур: ${tour.title || tour.location}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 500;">Новый тур от MARK INVEST TOUR</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          ${tourImage ? `<img src="${tourImage}" alt="${tour.title || tour.location}" style="width: 100%; max-width: 560px; height: auto; border-radius: 12px; margin-bottom: 20px;">` : ''}
          <h2 style="color: #1f1f1f; margin-top: 0; font-size: 24px; font-weight: 500;">${tour.title || tour.location}</h2>
          ${tour.short_description ? `<p style="color: #666; font-size: 16px; margin: 15px 0;">${tour.short_description}</p>` : ''}
          ${tour.description ? `<p style="color: #333; font-size: 14px; margin: 15px 0;">${tour.description.substring(0, 200)}${tour.description.length > 200 ? '...' : ''}</p>` : ''}
          <div style="margin: 25px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            ${tour.location ? `<p style="margin: 8px 0; color: #333;"><strong>📍 Место:</strong> ${tour.location}</p>` : ''}
            ${tour.duration ? `<p style="margin: 8px 0; color: #333;"><strong>⏱ Длительность:</strong> ${tour.duration}</p>` : ''}
            ${tour.date_start ? `<p style="margin: 8px 0; color: #333;"><strong>📅 Дата начала:</strong> ${new Date(tour.date_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
            ${tour.price ? `<p style="margin: 8px 0; color: #333; font-size: 18px;"><strong>💰 Цена:</strong> от ${parseInt(tour.price).toLocaleString('ru-RU')} ₽</p>` : ''}
          </div>
          <a href="${tourUrl}" style="display: inline-block; background-color: #ff5733; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 40px; font-weight: 500; font-size: 16px; margin: 20px 0; transition: background-color 0.3s;">Подробнее о туре</a>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="color: #999; font-size: 12px; margin: 0;">Вы получили это письмо, потому что подписались на уведомления о новых турах на сайте neverend.travel</p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
            <a href="${siteUrl}/unsubscribe?email={email}" style="color: #999; text-decoration: underline;">Отписаться от рассылки</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация текстового шаблона письма о новом туре
   * @private
   */
  _generateTourEmailText(tour, tourUrl) {
    const siteUrl = getSiteUrl();
    
    return `
Новый тур от MARK INVEST TOUR

${tour.title || tour.location}

${tour.short_description || ''}

${tour.location ? `Место: ${tour.location}` : ''}
${tour.duration ? `Длительность: ${tour.duration}` : ''}
${tour.date_start ? `Дата начала: ${new Date(tour.date_start).toLocaleDateString('ru-RU')}` : ''}
${tour.price ? `Цена: от ${parseInt(tour.price).toLocaleString('ru-RU')} ₽` : ''}

Подробнее: ${tourUrl}

---
Вы получили это письмо, потому что подписались на уведомления о новых турах.
Отписаться: ${siteUrl}/unsubscribe?email={email}
    `;
  }
}

module.exports = new EmailService();

