/**
 * Утилиты для работы с валютой
 * @module utils/currency.utils
 */

(function() {
    'use strict';

    // Глобальное состояние валюты
    let currentCurrency = 'RUB';

    /**
     * Установить текущую валюту
     * @param {string} currency - Код валюты (RUB, USD)
     */
    function setCurrency(currency) {
        currentCurrency = currency;
        window.currentCurrency = currency;
    }

    /**
     * Получить текущую валюту
     * @returns {string}
     */
    function getCurrency() {
        return currentCurrency;
    }

    /**
     * Форматировать цену с учетом валюты
     * @param {number} price - Цена в рублях
     * @param {string} [currency] - Код валюты (если не указан, используется текущая)
     * @returns {string} Отформатированная цена
     */
    function formatPrice(price, currency = null) {
        if (!price) return '';
        
        const curr = currency || currentCurrency;
        const priceNum = parseInt(price);
        
        if (curr === 'USD') {
            // Примерный курс (можно получать из API)
            const exchangeRate = window.exchangeRate || 101.23;
            const usdPrice = Math.round(priceNum / exchangeRate);
            return `от ${usdPrice.toLocaleString('ru-RU')} $`;
        } else {
            return `от ${priceNum.toLocaleString('ru-RU')} ₽`;
        }
    }

    // Экспорт в глобальный объект
    window.CurrencyUtils = {
        setCurrency,
        getCurrency,
        formatPrice
    };
})();

