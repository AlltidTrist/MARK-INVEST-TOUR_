/**
 * Компонент для обработки hover эффектов карточек
 * @module components/CardHover
 */

(function() {
    'use strict';

    /**
     * Настроить hover эффекты для карточки
     * @param {HTMLElement} card - Элемент карточки
     */
    function setupCardHover(card) {
        if (!card) return;

        // Находим изображение внутри карточки
        const imageElement = card.querySelector('.tour-card-image, .t-bgimg, [data-bg]');
        if (!imageElement) return;

        // Обработчик наведения мыши
        card.addEventListener('mouseenter', () => {
            if (imageElement) {
                imageElement.style.transition = 'transform 0.3s ease';
                imageElement.style.transform = 'scale(1.05)';
            }
            card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
        });

        // Обработчик ухода мыши
        card.addEventListener('mouseleave', () => {
            if (imageElement) {
                imageElement.style.transform = 'scale(1)';
            }
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    }

    /**
     * Настроить hover эффекты для всех карточек на странице
     * @param {string} [selector='.travelCard, .preorderCard'] - Селектор карточек
     */
    function setupAllCardsHover(selector = '.travelCard, .preorderCard') {
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            if (!card.hasAttribute('data-hover-initialized')) {
                setupCardHover(card);
                card.setAttribute('data-hover-initialized', 'true');
            }
        });
    }

    // Экспорт
    if (typeof window !== 'undefined') {
        window.setupCardHover = setupCardHover;
        window.setupAllCardsHover = setupAllCardsHover;
    }
})();

