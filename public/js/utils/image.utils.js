/**
 * Утилиты для работы с изображениями
 * @module utils/image.utils
 */

(function() {
    'use strict';

    /**
     * Инициализация lazy loading для изображения
     * @param {HTMLElement} imgElement - Элемент изображения
     */
    function initLazyImage(imgElement) {
        if (!imgElement) return;

        if (!('IntersectionObserver' in window)) {
            // Fallback для старых браузеров - загружаем сразу
            const bgUrl = imgElement.getAttribute('data-bg');
            if (bgUrl) {
                imgElement.style.backgroundImage = `url('${bgUrl}')`;
                imgElement.style.opacity = '1';
                imgElement.classList.add('loaded');
            }
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bgUrl = entry.target.getAttribute('data-bg');
                    if (bgUrl) {
                        const img = new Image();
                        img.onload = () => {
                            entry.target.style.backgroundImage = `url('${bgUrl}')`;
                            entry.target.style.opacity = '1';
                            entry.target.style.transition = 'opacity 0.3s ease-in-out';
                            entry.target.classList.add('loaded');
                        };
                        img.onerror = () => {
                            entry.target.style.opacity = '1';
                            entry.target.classList.add('loaded');
                        };
                        img.src = bgUrl;
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px' // Начинаем загрузку за 50px до появления в viewport
        });

        imageObserver.observe(imgElement);
    }

    // Экспорт в глобальный объект
    window.ImageUtils = {
        initLazyImage
    };
    
    // Также экспортируем напрямую для обратной совместимости
    window.initLazyImage = initLazyImage;
})();

