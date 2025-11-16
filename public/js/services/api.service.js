/**
 * Сервис для HTTP запросов к API
 * @module services/api.service
 */

(function() {
    'use strict';

    const API_URL = window.API_URL || '/api';

    /**
     * Выполнить GET запрос
     * @param {string} endpoint - Endpoint API
     * @param {Object} [params] - Query параметры
     * @returns {Promise<any>}
     */
    async function get(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            if (window.Logger) {
                window.Logger.error('API GET error:', err);
            } else {
                console.error('API GET error:', err);
            }
            throw err;
        }
    }

    /**
     * Выполнить POST запрос
     * @param {string} endpoint - Endpoint API
     * @param {Object} [data] - Данные для отправки
     * @returns {Promise<any>}
     */
    async function post(endpoint, data = {}) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            if (window.Logger) {
                window.Logger.error('API POST error:', err);
            } else {
                console.error('API POST error:', err);
            }
            throw err;
        }
    }

    /**
     * Выполнить PUT запрос
     * @param {string} endpoint - Endpoint API
     * @param {Object} [data] - Данные для отправки
     * @returns {Promise<any>}
     */
    async function put(endpoint, data = {}) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            if (window.Logger) {
                window.Logger.error('API PUT error:', err);
            } else {
                console.error('API PUT error:', err);
            }
            throw err;
        }
    }

    /**
     * Выполнить DELETE запрос
     * @param {string} endpoint - Endpoint API
     * @returns {Promise<any>}
     */
    async function del(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            if (window.Logger) {
                window.Logger.error('API DELETE error:', err);
            } else {
                console.error('API DELETE error:', err);
            }
            throw err;
        }
    }

    // Экспорт в глобальный объект
    window.ApiService = {
        get,
        post,
        put,
        delete: del
    };
})();

