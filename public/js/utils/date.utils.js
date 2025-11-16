/**
 * Утилиты для работы с датами
 * @module utils/date.utils
 */

(function() {
    'use strict';

    /**
     * Форматировать дату для отображения в карточке тура
     * @param {string|Date} dateStart - Дата начала
     * @param {string|Date} dateEnd - Дата окончания (опционально)
     * @returns {string} Отформатированная строка даты
     */
    function formatTourDate(dateStart, dateEnd = null) {
        if (!dateStart) return '';
        
        const startDate = new Date(dateStart);
        
        if (dateEnd) {
            const endDate = new Date(dateEnd);
            return `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString('ru-RU', { month: 'long' })} ${endDate.getFullYear()}`;
        } else {
            return `${startDate.getDate()} ${startDate.toLocaleDateString('ru-RU', { month: 'long' })} ${startDate.getFullYear()}`;
        }
    }

    /**
     * Сравнить две даты для сортировки
     * @param {string|Date} dateA
     * @param {string|Date} dateB
     * @returns {number} Результат сравнения (-1, 0, 1)
     */
    function compareDates(dateA, dateB) {
        const timeA = dateA ? new Date(dateA).getTime() : 0;
        const timeB = dateB ? new Date(dateB).getTime() : 0;
        return timeA - timeB;
    }

    // Экспорт в глобальный объект
    window.DateUtils = {
        formatTourDate,
        compareDates
    };
})();

