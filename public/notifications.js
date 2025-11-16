// Система красивых уведомлений и валидации

// Создание контейнера для уведомлений
function initNotifications() {
    if (document.getElementById('notifications-container')) {
        return;
    }
    
    const container = document.createElement('div');
    container.id = 'notifications-container';
    container.className = 'notifications-container';
    document.body.appendChild(container);
}

// Показать уведомление
function showNotification(message, type = 'info', duration = 5000) {
    initNotifications();
    
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Иконки для разных типов
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" aria-label="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <div class="notification-progress"></div>
    `;
    
    container.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое закрытие
    let progressBar = notification.querySelector('.notification-progress');
    if (duration > 0 && progressBar) {
        progressBar.style.animation = `notification-progress ${duration}ms linear forwards`;
    }
    
    const autoClose = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Закрытие по клику
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoClose);
        closeNotification(notification);
    });
    
    return notification;
}

// Закрыть уведомление
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Удобные функции для разных типов уведомлений
function showSuccess(message, duration = 5000) {
    return showNotification(message, 'success', duration);
}

function showError(message, duration = 6000) {
    return showNotification(message, 'error', duration);
}

function showWarning(message, duration = 5000) {
    return showNotification(message, 'warning', duration);
}

function showInfo(message, duration = 5000) {
    return showNotification(message, 'info', duration);
}

// Подтверждение действия
function showConfirm(message, onConfirm, onCancel = null) {
    initNotifications();
    
    const container = document.getElementById('notifications-container');
    const confirm = document.createElement('div');
    confirm.className = 'notification-confirm';
    
    confirm.innerHTML = `
        <div class="notification-confirm-content">
            <div class="notification-confirm-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="notification-confirm-message">${message}</div>
            <div class="notification-confirm-buttons">
                <button class="notification-confirm-btn notification-confirm-btn-cancel">Отмена</button>
                <button class="notification-confirm-btn notification-confirm-btn-confirm">Подтвердить</button>
            </div>
        </div>
    `;
    
    container.appendChild(confirm);
    
    setTimeout(() => {
        confirm.classList.add('show');
    }, 10);
    
    const confirmBtn = confirm.querySelector('.notification-confirm-btn-confirm');
    const cancelBtn = confirm.querySelector('.notification-confirm-btn-cancel');
    
    confirmBtn.addEventListener('click', () => {
        closeConfirm(confirm);
        if (onConfirm) onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeConfirm(confirm);
        if (onCancel) onCancel();
    });
    
    // Закрытие по клику вне области
    const overlay = document.createElement('div');
    overlay.className = 'notification-confirm-overlay';
    container.appendChild(overlay);
    
    overlay.addEventListener('click', () => {
        closeConfirm(confirm);
        if (onCancel) onCancel();
    });
    
    return confirm;
}

function closeConfirm(confirm) {
    const overlay = document.querySelector('.notification-confirm-overlay');
    if (overlay) {
        overlay.remove();
    }
    confirm.classList.remove('show');
    confirm.classList.add('hide');
    setTimeout(() => {
        if (confirm.parentNode) {
            confirm.parentNode.removeChild(confirm);
        }
    }, 300);
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}

