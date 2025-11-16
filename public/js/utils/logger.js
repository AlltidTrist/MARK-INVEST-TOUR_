/**
 * Утилита для логирования (замена console.log)
 * @module utils/logger
 */

(function() {
    'use strict';

    const isDevelopment = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    /**
     * Логирование информации
     * @param {...any} args
     */
    function log(...args) {
        if (isDevelopment) {
            console.log('[INFO]', ...args);
        }
    }

    /**
     * Логирование ошибок (всегда показываются)
     * @param {...any} args
     */
    function error(...args) {
        console.error('[ERROR]', ...args);
    }

    /**
     * Логирование предупреждений
     * @param {...any} args
     */
    function warn(...args) {
        if (isDevelopment) {
            console.warn('[WARN]', ...args);
        }
    }

    /**
     * Логирование отладочной информации (только в development)
     * @param {...any} args
     */
    function debug(...args) {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args);
        }
    }

    // Экспорт в глобальный объект
    window.Logger = {
        log,
        error,
        warn,
        debug
    };
})();

