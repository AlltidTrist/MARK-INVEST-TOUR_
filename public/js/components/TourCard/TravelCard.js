/**
 * Компонент карточки тура для сетки (travelCard)
 * @module components/TourCard/TravelCard
 */

(function() {
    'use strict';

    // Используем глобальные утилиты
    const DateUtils = window.DateUtils || null;
    const CurrencyUtils = window.CurrencyUtils || null;
    const ImageUtils = window.ImageUtils || { initLazyImage: window.initLazyImage };

    /**
     * Класс для создания карточек туров в сетке
     */
    class TravelCard {
        /**
         * @param {Object} tour - Данные тура
         */
        constructor(tour) {
            if (!tour || !tour.id) {
                throw new Error('Tour data is required');
            }
            this.tour = tour;
            this.card = null;
        }

        /**
         * Создать карточку
         * @returns {HTMLElement}
         */
        create() {
            this.card = document.createElement('div');
            this.card.className = 'travelCard';
            this.card.setAttribute('data-tour-id', this.tour.id);
            this.card.setAttribute('data-dynamic-card', 'true');
            this.card.setAttribute('data-tilda-ignore', 'true');
            this.card.setAttribute('data-tour-url', this._getTourUrl());

            // Изображение
            const imageDiv = this._createImage();
            this.card.appendChild(imageDiv);

            // Контент
            const contentDiv = this._createContent();
            this.card.appendChild(contentDiv);

            // Обработчики событий
            this._attachEventListeners();

            return this.card;
        }

        /**
         * Создать элемент изображения
         * @private
         * @returns {HTMLElement}
         */
        _createImage() {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'tour-card-image lazy-image';
            imageDiv.setAttribute('data-bg', this._getImageUrl());

            // Инициализируем lazy loading
            setTimeout(() => {
                const initLazyImage = ImageUtils.initLazyImage || window.initLazyImage;
                if (typeof initLazyImage === 'function') {
                    initLazyImage(imageDiv);
                }
            }, 0);

            return imageDiv;
        }

        /**
         * Создать контент карточки
         * @private
         * @returns {HTMLElement}
         */
        _createContent() {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'tour-card-content';

            // Мета-информация
            const metaDiv = this._createMeta();
            contentDiv.appendChild(metaDiv);

            // Название
            const titleDiv = this._createTitle();
            contentDiv.appendChild(titleDiv);

            // Описание
            if (this.tour.short_description) {
                const descDiv = this._createDescription();
                contentDiv.appendChild(descDiv);
            }

            return contentDiv;
        }

        /**
         * Получить отформатированную дату
         * @private
         * @returns {string}
         */
        _getFormattedDate() {
            if (DateUtils && DateUtils.formatTourDate) {
                return DateUtils.formatTourDate(this.tour.date_start, this.tour.date_end);
            }
            // Fallback
            if (this.tour.date_start && this.tour.date_end) {
                const startDate = new Date(this.tour.date_start);
                const endDate = new Date(this.tour.date_end);
                return `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString('ru-RU', { month: 'long' })} ${endDate.getFullYear()}`;
            } else if (this.tour.date_start) {
                const startDate = new Date(this.tour.date_start);
                return `${startDate.getDate()} ${startDate.toLocaleDateString('ru-RU', { month: 'long' })} ${startDate.getFullYear()}`;
            }
            return '';
        }

        /**
         * Получить отформатированную цену
         * @private
         * @returns {string}
         */
        _getFormattedPrice() {
            if (CurrencyUtils && CurrencyUtils.formatPrice) {
                return CurrencyUtils.formatPrice(this.tour.price);
            }
            // Fallback
            const translations = window.i18n && window.i18n.getTranslations ? window.i18n.getTranslations() : {};
            const fromText = translations.common?.from || 'от';
            return this.tour.price ? `${fromText} ${this.tour.price.toLocaleString('ru-RU')} ₽` : '';
        }

        /**
         * Получить URL изображения
         * @private
         * @returns {string}
         */
        _getImageUrl() {
            if (this.tour.image_url) {
                return this.tour.image_url.startsWith('/') 
                    ? this.tour.image_url 
                    : `/${this.tour.image_url}`;
            }
            return '/assets/images/hero_background-min.jpg';
        }

        /**
         * Получить URL тура
         * @private
         * @returns {string}
         */
        _getTourUrl() {
            return `/tour/${this.tour.id}`;
        }

        /**
         * Создать мета-информацию (дата и цена)
         * @private
         * @returns {HTMLElement}
         */
        _createMeta() {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'tour-card-meta';

            const dateText = this._getFormattedDate();
            const priceText = this._getFormattedPrice();

            if (dateText) {
                const dateSpan = document.createElement('span');
                dateSpan.className = 'tour-card-date';
                dateSpan.textContent = dateText;
                metaDiv.appendChild(dateSpan);
            }

            if (dateText && priceText) {
                const separatorSpan = document.createElement('span');
                separatorSpan.className = 'tour-card-separator';
                separatorSpan.textContent = ' • ';
                metaDiv.appendChild(separatorSpan);
            }

            if (priceText) {
                const priceSpan = document.createElement('span');
                priceSpan.className = 'tour-card-price price';
                priceSpan.setAttribute('data-price-rub', this.tour.price || '');
                priceSpan.textContent = priceText;
                metaDiv.appendChild(priceSpan);
            }

            return metaDiv;
        }

        /**
         * Создать заголовок
         * @private
         * @returns {HTMLElement}
         */
        _createTitle() {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'tour-card-title';
            const translations = window.i18n && window.i18n.getTranslations ? window.i18n.getTranslations() : {};
            const tourText = translations.calendar?.tour || 'Тур';
            titleDiv.textContent = this.tour.title || tourText;
            return titleDiv;
        }

        /**
         * Создать описание
         * @private
         * @returns {HTMLElement}
         */
        _createDescription() {
            const descDiv = document.createElement('div');
            descDiv.className = 'tour-card-description';
            descDiv.textContent = this.tour.short_description;
            return descDiv;
        }

        /**
         * Прикрепить обработчики событий
         * @private
         */
        _attachEventListeners() {
            // Обработчик клика на всю карточку
            this.card.addEventListener('click', (e) => {
                if (e.target.closest('a, button')) {
                    return;
                }

                try {
                    if (typeof window.trackTourClick === 'function') {
                        window.trackTourClick(this.tour.id);
                    }
                } catch (err) {
                    // Игнорируем ошибки аналитики
                }

                window.location.href = this._getTourUrl();
            });
        }
    }

    // Экспорт
    if (typeof window !== 'undefined') {
        window.TravelCard = TravelCard;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TravelCard;
    }
})();

