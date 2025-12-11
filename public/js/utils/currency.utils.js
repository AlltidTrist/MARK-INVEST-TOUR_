/**
 * Утилиты для работы с валютой
 * @module utils/currency.utils
 */

(function() {
    'use strict';

    // Глобальное состояние валюты - всегда EUR
    let currentCurrency = 'EUR';

    /**
     * Установить текущую валюту (не используется, всегда EUR)
     * @param {string} currency - Код валюты
     */
    function setCurrency(currency) {
        // Всегда используем EUR
        currentCurrency = 'EUR';
        window.currentCurrency = 'EUR';
    }

    /**
     * Получить текущую валюту
     * @returns {string}
     */
    function getCurrency() {
        return 'EUR';
    }

    /**
     * Форматировать цену (цены уже в евро)
     * @param {number} price - Цена в евро
     * @param {string} [currency] - Игнорируется, всегда используется EUR
     * @returns {string} Отформатированная цена
     */
    function formatPrice(price, currency = null) {
        if (!price) return '';
        
        // Цены уже в евро, показываем как есть
        const priceNum = parseInt(price);
        return `от ${priceNum.toLocaleString('ru-RU')}€`;
    }

    // Экспорт в глобальный объект
    window.CurrencyUtils = {
        setCurrency,
        getCurrency,
        formatPrice
    };
})();

