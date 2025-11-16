// Система мультиязычности

(function() {
    'use strict';
    
    const DEFAULT_LANG = 'ru';
    let currentLang = localStorage.getItem('language') || DEFAULT_LANG;
    let translations = {};
    const localesBaseUrl = getLocalesBaseUrl();
    
    function getLocalesBaseUrl() {
        if (typeof window === 'undefined') {
            return '/public/locales/';
        }
        
        const scripts = document.getElementsByTagName('script');
        const currentScript = document.currentScript || Array.from(scripts).find(script => {
            return script.src && script.src.includes('/i18n');
        });
        
        if (currentScript && currentScript.src) {
            try {
                const scriptUrl = new URL(currentScript.src, window.location.href);
                return new URL('./locales/', scriptUrl).href;
            } catch (error) {
                console.warn('Не удалось определить путь до переводов, используем путь по умолчанию', error);
            }
        }
        
        return `${window.location.origin}/public/locales/`;
    }
    
    // Загрузка переводов
    async function loadTranslations(lang) {
        try {
            const response = await fetch(new URL(`${lang}.json`, localesBaseUrl));
            if (!response.ok) {
                throw new Error('Translations not found');
            }
            translations[lang] = await response.json();
            return translations[lang];
        } catch (error) {
            console.warn(`Translations for ${lang} not found, using default`);
            if (lang !== DEFAULT_LANG) {
                return loadTranslations(DEFAULT_LANG);
            }
            return {};
        }
    }
    
    // Инициализация
    async function initI18n() {
        await loadTranslations(currentLang);
        applyTranslations();
        updateLanguageSwitcher();
    }
    
    // Применение переводов
    function applyTranslations() {
        const langData = translations[currentLang] || {};
        
        // Переводим элементы с data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = getNestedTranslation(langData, key);
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Переводим элементы с data-translate-html
        document.querySelectorAll('[data-translate-html]').forEach(element => {
            const key = element.getAttribute('data-translate-html');
            const translation = getNestedTranslation(langData, key);
            if (translation) {
                element.innerHTML = translation;
            }
        });
        
        // Обновляем атрибуты
        document.querySelectorAll('[data-translate-attr]').forEach(element => {
            const attrData = element.getAttribute('data-translate-attr');
            const [attr, key] = attrData.split(':');
            const translation = getNestedTranslation(langData, key);
            if (translation) {
                element.setAttribute(attr, translation);
            }
        });
        
        // Обновляем title страницы
        if (langData.pageTitle) {
            document.title = langData.pageTitle;
        }
        
        // Обновляем meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && langData.pageDescription) {
            metaDesc.setAttribute('content', langData.pageDescription);
        }
    }
    
    // Получение вложенного перевода
    function getNestedTranslation(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
    
    // Переключение языка
    async function switchLanguage(lang) {
        if (lang === currentLang) return;
        
        if (!translations[lang]) {
            await loadTranslations(lang);
        }
        
        currentLang = lang;
        localStorage.setItem('language', lang);
        applyTranslations();
        updateLanguageSwitcher();
        
        // Диспатчим событие для других модулей
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    // Обновление переключателя языка
    function updateLanguageSwitcher() {
        const switchers = document.querySelectorAll('.language-switcher, [data-language-switcher]');
        switchers.forEach(switcher => {
            const buttons = switcher.querySelectorAll('[data-lang]');
            buttons.forEach(btn => {
                const btnLang = btn.getAttribute('data-lang');
                if (btnLang === currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    }
    
    // Получить текущий язык
    function getCurrentLanguage() {
        return currentLang;
    }
    
    // Получить перевод
    function t(key, defaultValue = '') {
        const translation = getNestedTranslation(translations[currentLang] || {}, key);
        return translation || defaultValue || key;
    }
    
    // Экспорт функций
    if (typeof window !== 'undefined') {
        window.i18n = {
            switchLanguage,
            getCurrentLanguage,
            t,
            init: initI18n,
            applyTranslations,
            getTranslations: () => translations[currentLang] || {}
        };
        
        // Слушаем событие смены языка для обновления динамического контента
        document.addEventListener('languageChanged', (e) => {
            // Применяем переводы ко всем элементам, включая динамически добавленные
            applyTranslations();
            
            // Вызываем специальные функции для обновления динамического контента
            if (typeof window.updateCalendarTranslations === 'function') {
                window.updateCalendarTranslations();
            }
            if (typeof window.updateTourCardsTranslations === 'function') {
                window.updateTourCardsTranslations();
            }
        });
    }
    
    // Автоинициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
})();

