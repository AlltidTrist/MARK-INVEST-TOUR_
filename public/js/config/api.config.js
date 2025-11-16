/**
 * Конфигурация API
 * @module config/api.config
 */

(function() {
    'use strict';

    // Используем глобальный API_URL или создаем его
    if (typeof window.API_URL === 'undefined') {
        window.API_URL = '/api';
    }

    // Глобальные настройки
    window.allTours = window.allTours || [];
    window.currentPage = window.currentPage || 1;
    window.toursPerPage = window.toursPerPage || 6;

    // Экспорт конфигурации
    window.ApiConfig = {
        getApiUrl: () => window.API_URL,
        API_URL: window.API_URL
    };
})();

