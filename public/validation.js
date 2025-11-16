// Система валидации форм

// Валидация полей
const validators = {
    required: (value, field) => {
        if (!value || value.trim() === '') {
            return 'Это поле обязательно для заполнения';
        }
        return null;
    },
    
    email: (value, field) => {
        if (value && value.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Введите корректный email адрес';
            }
        }
        return null;
    },
    
    phone: (value, field) => {
        if (value && value.trim() !== '') {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
                return 'Введите корректный номер телефона';
            }
        }
        return null;
    },
    
    minLength: (value, field, min) => {
        if (value && value.length < min) {
            return `Минимальная длина: ${min} символов`;
        }
        return null;
    },
    
    maxLength: (value, field, max) => {
        if (value && value.length > max) {
            return `Максимальная длина: ${max} символов`;
        }
        return null;
    }
};

// Валидация поля
function validateField(field, showError = true) {
    const value = field.value.trim();
    const fieldName = field.name || field.id || 'поле';
    let error = null;
    
    // Проверка required
    if (field.hasAttribute('required') || field.classList.contains('required')) {
        error = validators.required(value, field);
        if (error) {
            showFieldError(field, error);
            return false;
        }
    }
    
    // Проверка типа поля
    if (field.type === 'email' && value) {
        error = validators.email(value, field);
        if (error) {
            showFieldError(field, error);
            return false;
        }
    }
    
    if (field.type === 'tel' && value) {
        error = validators.phone(value, field);
        if (error) {
            showFieldError(field, error);
            return false;
        }
    }
    
    // Проверка minlength и maxlength
    if (field.hasAttribute('minlength')) {
        const min = parseInt(field.getAttribute('minlength'));
        error = validators.minLength(value, field, min);
        if (error) {
            showFieldError(field, error);
            return false;
        }
    }
    
    if (field.hasAttribute('maxlength')) {
        const max = parseInt(field.getAttribute('maxlength'));
        error = validators.maxLength(value, field, max);
        if (error) {
            showFieldError(field, error);
            return false;
        }
    }
    
    // Если все проверки пройдены
    if (showError) {
        clearFieldError(field);
    }
    return true;
}

// Показать ошибку поля
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('field-error');
    
    // Создаем элемент с ошибкой
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error-message';
    errorElement.textContent = message;
    
    // Вставляем после поля
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Фокус на поле с ошибкой
    if (document.activeElement !== field) {
        field.focus();
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Очистить ошибку поля
function clearFieldError(field) {
    field.classList.remove('field-error');
    
    const errorElement = field.parentNode.querySelector('.field-error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Валидация всей формы
function validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required], select[required], .required');
    let isValid = true;
    const firstErrorField = [];
    
    fields.forEach(field => {
        if (!validateField(field, true)) {
            isValid = false;
            if (firstErrorField.length === 0) {
                firstErrorField.push(field);
            }
        }
    });
    
    // Дополнительная валидация для специальных полей
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !validateField(field, true)) {
            isValid = false;
        }
    });
    
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !validateField(field, true)) {
            isValid = false;
        }
    });
    
    if (!isValid && firstErrorField.length > 0) {
        firstErrorField[0].focus();
        // Не прокручиваем для формы подписки, чтобы не "магнитить" экран
        if (form.id !== 'subscription-form') {
            firstErrorField[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

// Инициализация валидации для формы
function initFormValidation(form) {
    // Валидация при потере фокуса
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        field.addEventListener('blur', () => {
            if (field.value || field.hasAttribute('required')) {
                validateField(field);
            }
        });
        
        // Очистка ошибки при вводе
        field.addEventListener('input', () => {
            if (field.classList.contains('field-error')) {
                clearFieldError(field);
            }
        });
    });
    
    // Валидация при отправке формы
    form.addEventListener('submit', (e) => {
        if (!validateForm(form)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
}

// Автоматическая инициализация для всех форм
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        initFormValidation(form);
    });
});

// Инициализация для динамически добавленных форм
const formObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                if (node.tagName === 'FORM') {
                    initFormValidation(node);
                } else {
                    const forms = node.querySelectorAll && node.querySelectorAll('form');
                    if (forms) {
                        forms.forEach(form => initFormValidation(form));
                    }
                }
            }
        });
    });
});

formObserver.observe(document.body, {
    childList: true,
    subtree: true
});

