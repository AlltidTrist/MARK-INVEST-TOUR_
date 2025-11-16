// Календарь доступности туров

(function() {
    'use strict';
    
    const API_URL = window.API_URL || '/api';
    let toursData = null; // Сохраняем данные туров для перерисовки
    
    // Получение переводов
    function getTranslations() {
        if (window.i18n && window.i18n.getTranslations) {
            return window.i18n.getTranslations();
        }
        return {};
    }
    
    // Получение перевода месяца
    function getMonthName(monthIndex) {
        const translations = getTranslations();
        const months = translations.calendar?.months || ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return months[monthIndex] || 'Январь';
    }
    
    // Получение переводов дней недели
    function getWeekdayNames() {
        const translations = getTranslations();
        return translations.calendar?.weekdays || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    }
    
    // Получение текста "Тур"
    function getTourText() {
        const translations = getTranslations();
        return translations.calendar?.tour || 'Тур';
    }
    
    // Инициализация календаря
    function initTourCalendar(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        loadToursForCalendar();
    }
    
    // Загрузка туров для календаря
    async function loadToursForCalendar() {
        try {
            const response = await fetch(`${API_URL}/tours?status=active`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки туров');
            }
            
            toursData = await response.json();
            renderCalendar(toursData);
        } catch (error) {
            console.error('Ошибка загрузки туров для календаря:', error);
            if (typeof showError !== 'undefined') {
                showError('Ошибка загрузки календаря');
            }
        }
    }
    
    // Рендеринг календаря
    function renderCalendar(tours) {
        const container = document.getElementById('tour-calendar');
        if (!container) return;
        
        toursData = tours; // Сохраняем для перерисовки
        
        // Группируем туры по датам
        const toursByDate = {};
        tours.forEach(tour => {
            if (tour.date_start) {
                const date = new Date(tour.date_start);
                const dateKey = date.toISOString().split('T')[0];
                
                if (!toursByDate[dateKey]) {
                    toursByDate[dateKey] = [];
                }
                toursByDate[dateKey].push(tour);
            }
        });
        
        // Получаем текущую дату
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Генерируем календарь на 3 месяца вперед
        let calendarHTML = '<div class="calendar-months">';
        
        for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
            const month = new Date(currentYear, currentMonth + monthOffset, 1);
            calendarHTML += generateMonthCalendar(month, toursByDate, today);
        }
        
        calendarHTML += '</div>';
        container.innerHTML = calendarHTML;
    }
    
    // Генерация календаря на месяц
    function generateMonthCalendar(month, toursByDate, today) {
        const monthNames = getMonthName;
        const dayNames = getWeekdayNames();
        const tourText = getTourText();
        
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0
        
        let html = `
            <div class="calendar-month">
                <h3 class="calendar-month-title">${monthNames(monthIndex)} ${year}</h3>
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        ${dayNames.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
                    </div>
                    <div class="calendar-days">
        `;
        
        // Пустые ячейки до первого дня месяца
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dateKey = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today && !isToday;
            const toursOnDate = toursByDate[dateKey] || [];
            const hasTours = toursOnDate.length > 0;
            
            let dayClass = 'calendar-day';
            if (isPast) dayClass += ' past';
            if (isToday) dayClass += ' today';
            if (hasTours) dayClass += ' has-tours';
            
            html += `<div class="${dayClass}" data-date="${dateKey}" ${hasTours ? `onclick="window.location.href='/tour/${toursOnDate[0].id}'"` : ''}>`;
            html += `<span class="calendar-day-number">${day}</span>`;
            
            if (hasTours) {
                html += `<div class="calendar-day-tours">${toursOnDate.length}</div>`;
                html += `<div class="calendar-day-tooltip">`;
                toursOnDate.forEach(tour => {
                    html += `<div class="calendar-tour-item" onclick="event.stopPropagation(); window.location.href='/tour/${tour.id}'">${tour.title || tour.location || tourText}</div>`;
                });
                html += `</div>`;
            }
            
            html += `</div>`;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    // Обновление переводов календаря
    function updateCalendarTranslations() {
        if (toursData) {
            renderCalendar(toursData);
        }
    }
    
    // Экспорт функций
    if (typeof window !== 'undefined') {
        window.initTourCalendar = initTourCalendar;
        window.updateCalendarTranslations = updateCalendarTranslations;
    }
    
    // Автоинициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('tour-calendar')) {
                initTourCalendar('tour-calendar');
            }
        });
    } else {
        if (document.getElementById('tour-calendar')) {
            initTourCalendar('tour-calendar');
        }
    }
})();

