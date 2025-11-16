/**
 * Сервис для работы с турами
 * @module services/tour.service
 */

(function() {
    'use strict';

    /**
     * Загрузить все активные туры
     * @param {Object} [filters] - Фильтры поиска
     * @returns {Promise<Array>}
     */
    async function loadTours(filters = {}) {
        try {
            if (window.Logger) {
                window.Logger.log('Загрузка туров из API...');
            }
            
            const apiService = window.ApiService;
            if (!apiService) {
                throw new Error('ApiService не загружен');
            }
            
            const tours = await apiService.get('/tours', { status: 'active', ...filters });
            
            if (!tours || tours.length === 0) {
                if (window.Logger) {
                    window.Logger.log('Туры не найдены или пустой массив');
                }
                return [];
            }

            if (window.Logger) {
                window.Logger.log(`Загружено ${tours.length} туров из API`);
            }
            return tours;
        } catch (err) {
            if (window.Logger) {
                window.Logger.error('Ошибка загрузки туров:', err);
            } else {
                console.error('Ошибка загрузки туров:', err);
            }
            throw err;
        }
    }

    /**
     * Загрузить один тур по ID
     * @param {number} id - ID тура
     * @returns {Promise<Object>}
     */
    async function loadTourById(id) {
        try {
            const apiService = window.ApiService;
            if (!apiService) {
                throw new Error('ApiService не загружен');
            }
            const tour = await apiService.get(`/tours/${id}`);
            return tour;
        } catch (err) {
            if (window.Logger) {
                window.Logger.error(`Ошибка загрузки тура ${id}:`, err);
            } else {
                console.error(`Ошибка загрузки тура ${id}:`, err);
            }
            throw err;
        }
    }

    /**
     * Отсортировать туры по дате начала
     * @param {Array} tours - Массив туров
     * @returns {Array} Отсортированный массив
     */
    function sortToursByDate(tours) {
        if (!window.DateUtils) {
            // Fallback если DateUtils не загружен
            return [...tours].sort((a, b) => {
                const timeA = a.date_start ? new Date(a.date_start).getTime() : 0;
                const timeB = b.date_start ? new Date(b.date_start).getTime() : 0;
                return timeA - timeB;
            });
        }
        return [...tours].sort((a, b) => window.DateUtils.compareDates(a.date_start, b.date_start));
    }

    // Экспорт в глобальный объект
    window.TourService = {
        loadTours,
        loadTourById,
        sortToursByDate
    };
})();

