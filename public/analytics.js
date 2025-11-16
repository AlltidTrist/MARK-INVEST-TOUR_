// Система аналитики для отслеживания событий

(function() {
  'use strict';
  
  const API_URL = window.API_URL || '/api';

  // Записать событие
  function trackEvent(eventType, eventName, tourId = null, userData = null) {
    try {
      // Отправляем событие на сервер
      fetch(`${API_URL}/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: eventType,
          event_name: eventName,
          tour_id: tourId,
          user_data: userData
        })
      }).catch(err => {
        // Тихая ошибка - не блокируем работу сайта
        if (console && console.error) {
          console.error('Ошибка отправки события аналитики:', err);
        }
      });
    } catch (err) {
      // Тихая ошибка
      if (console && console.error) {
        console.error('Ошибка trackEvent:', err);
      }
    }
  }

  // Отслеживание просмотра тура
  function trackTourView(tourId) {
    if (!tourId) return;
    trackEvent('page_view', 'tour_view', tourId, {
      url: window.location ? window.location.href : '',
      timestamp: new Date().toISOString()
    });
  }

  // Отслеживание клика по карточке тура
  function trackTourClick(tourId) {
    if (!tourId) return;
    trackEvent('click', 'tour_card_click', tourId);
  }

  // Отслеживание отправки формы
  function trackFormSubmit(formType, tourId = null) {
    if (!formType) return;
    trackEvent('form_submit', formType, tourId);
  }

  // Отслеживание переключения валюты
  function trackCurrencySwitch(fromCurrency, toCurrency) {
    trackEvent('user_action', 'currency_switch', null, {
      from: fromCurrency,
      to: toCurrency
    });
  }

  // Отслеживание поиска
  function trackSearch(searchTerm, resultsCount) {
    trackEvent('search', 'tour_search', null, {
      term: searchTerm,
      results: resultsCount
    });
  }

  // Экспортируем функции
  if (typeof window !== 'undefined') {
    window.trackEvent = trackEvent;
    window.trackTourView = trackTourView;
    window.trackTourClick = trackTourClick;
    window.trackFormSubmit = trackFormSubmit;
    window.trackCurrencySwitch = trackCurrencySwitch;
    window.trackSearch = trackSearch;
  }

  // Автоматическое отслеживание просмотров страниц туров
  if (typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.startsWith('/tour/')) {
    try {
      const tourId = window.location.pathname.split('/tour/')[1]?.split('/')[0];
      if (tourId) {
        // Отслеживаем просмотр после небольшой задержки (чтобы убедиться, что страница загрузилась)
        setTimeout(() => {
          trackTourView(parseInt(tourId));
        }, 2000);
      }
    } catch (err) {
      // Тихая ошибка
      if (console && console.error) {
        console.error('Ошибка инициализации аналитики:', err);
      }
    }
  }
})();

