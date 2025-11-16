/**
 * Утилиты для работы с DOM
 * @module utils/dom.utils
 */

(function() {
    'use strict';

    /**
     * Безопасно получить элемент по селектору
     * @param {string} selector - CSS селектор
     * @param {Element} [parent=document] - Родительский элемент
     * @returns {Element|null}
     */
    function safeQuerySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Invalid selector:', selector, error);
            }
            return null;
        }
    }

    /**
     * Безопасно получить все элементы по селектору
     * @param {string} selector - CSS селектор
     * @param {Element} [parent=document] - Родительский элемент
     * @returns {NodeList|Array}
     */
    function safeQuerySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Invalid selector:', selector, error);
            }
            return [];
        }
    }

    /**
     * Проверить, загружен ли элемент
     * @param {string} selector - CSS селектор
     * @param {number} [timeout=5000] - Таймаут в миллисекундах
     * @returns {Promise<Element>}
     */
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = safeQuerySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = safeQuerySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Удалить все дочерние элементы
     * @param {Element} element
     */
    function clearElement(element) {
        if (element) {
            element.innerHTML = '';
        }
    }

    /**
     * Проверить, является ли элемент видимым
     * @param {Element} element
     * @returns {boolean}
     */
    function isElementVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    // Экспорт в глобальный объект
    window.DomUtils = {
        safeQuerySelector,
        safeQuerySelectorAll,
        waitForElement,
        clearElement,
        isElementVisible
    };
})();
