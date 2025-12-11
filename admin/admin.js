// Админ-панель JavaScript

const API_URL = '/api';
let authToken = localStorage.getItem('authToken');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации - не блокируем, разрешаем просмотр туров
    // Авторизация потребуется только при редактировании
    if (!authToken) {
        console.warn('Токен авторизации не найден. Просмотр туров доступен, но редактирование требует авторизации.');
    }
    // Инициализация с обработкой ошибок
    try {
        loadTours();
        loadApplications();
        loadStats();
        loadAdminInfo();
        updateViewButtons();
    } catch (error) {
        console.error('Ошибка инициализации админ-панели:', error);
        alert('Ошибка загрузки админ-панели. Проверьте консоль браузера.');
    }
    
    // Обработчик формы тура
    const tourForm = document.getElementById('tourForm');
    if (tourForm) {
        tourForm.addEventListener('submit', handleTourSubmit);
        // Инициализируем валидацию для формы
        if (typeof initFormValidation !== 'undefined') {
            initFormValidation(tourForm);
        }
    }
    
    // Обработчик выбора файла
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }
    
    // Обработчик выбора файлов галереи
    const galleryInput = document.getElementById('gallery-images');
    if (galleryInput) {
        galleryInput.addEventListener('change', handleGallerySelect);
    }
    
    // Обработчик формы смены пароля
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
});

// Показать секцию
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(el => {
        el.style.display = 'none';
    });
    document.getElementById(`${section}-section`).style.display = 'block';
    
    document.querySelectorAll('.admin-nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Если это настройки, активируем кнопку настроек в header
    if (section === 'settings') {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.classList.add('active');
        }
    } else {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.classList.remove('active');
        }
        if (event && event.target) {
            event.target.classList.add('active');
        }
    }
    
    // Загружаем данные при открытии секции
    if (section === 'settings') {
        loadAdminInfo();
    } else if (section === 'stats') {
        loadStats();
    } else if (section === 'applications') {
        loadApplications();
    } else if (section === 'tours') {
        loadTours();
    }
}

// Показать форму тура
function showTourForm() {
    document.getElementById('tour-form').style.display = 'block';
    document.getElementById('tourForm').reset();
    document.getElementById('tourForm').removeAttribute('data-tour-id');
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('fileName').textContent = 'Файл не выбран';
    document.getElementById('programs-container').innerHTML = '';
    document.getElementById('inclusions-included-container').innerHTML = '';
    document.getElementById('inclusions-excluded-container').innerHTML = '';
    document.getElementById('prices-container').innerHTML = '';
    
    // Очищаем счетчики
    programDayCounter = 0;
    inclusionCounter = 0;
    priceCounter = 0;
    
    // Очищаем галерею
    galleryNewImages = [];
    galleryExistingImages = [];
    const galleryPreview = document.getElementById('galleryPreview');
    const galleryUploaded = document.getElementById('galleryUploaded');
    const galleryInput = document.getElementById('gallery-images');
    if (galleryPreview) galleryPreview.innerHTML = '';
    if (galleryUploaded) galleryUploaded.innerHTML = '';
    if (galleryInput) galleryInput.value = '';
}

// Загрузка галереи тура
async function loadTourGallery(tourId) {
    try {
        const response = await fetch(`${API_URL}/tours/${tourId}/images`);
        const images = await response.json();
        
        galleryExistingImages = images || [];
        const galleryUploaded = document.getElementById('galleryUploaded');
        galleryUploaded.innerHTML = '';
        
        if (images && images.length > 0) {
            images.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-uploaded-item';
                galleryItem.dataset.imageId = image.id;
                galleryItem.innerHTML = `
                    <img src="${image.image_url}" alt="Gallery image">
                    <button type="button" class="gallery-uploaded-item-remove" onclick="removeGalleryImage(${image.id}, ${tourId})">×</button>
                `;
                galleryUploaded.appendChild(galleryItem);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки галереи:', error);
    }
}

// Загрузка новых изображений в галерею
async function uploadGalleryImages(tourId) {
    for (const imageData of galleryNewImages) {
        try {
            const formData = new FormData();
            formData.append('image', imageData.file);
            formData.append('order', galleryExistingImages.length + galleryNewImages.indexOf(imageData));
            
            const response = await fetch(`${API_URL}/tours/${tourId}/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    window.location.href = '/admin/login.html';
                    return;
                }
                const errorText = await response.text();
                console.error('Ошибка загрузки изображения в галерею:', response.status, errorText);
                throw new Error(`Ошибка загрузки изображения: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
        }
    }
    
    // Очищаем новые изображения после загрузки
    galleryNewImages = [];
}

// Отмена формы тура
function cancelTourForm() {
    document.getElementById('tour-form').style.display = 'none';
    document.getElementById('tourForm').reset();
    document.getElementById('tourForm').removeAttribute('data-tour-id');
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('fileName').textContent = 'Файл не выбран';
    document.getElementById('programs-container').innerHTML = '';
}

// Добавить день программы
let programDayCounter = 0;
let inclusionCounter = 0;
let priceCounter = 0;

function addProgramDay() {
    const container = document.getElementById('programs-container');
    const dayIndex = programDayCounter++;
    const dayNumber = container.children.length + 1;
    
    const dayItem = document.createElement('div');
    dayItem.className = 'program-day-item';
    dayItem.dataset.dayIndex = dayIndex;
    
    dayItem.innerHTML = `
        <div class="program-day-item-header">
            <div class="program-day-item-title">День ${dayNumber}</div>
            <button type="button" class="btn-remove-day" onclick="removeProgramDay(${dayIndex})">Удалить</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label" for="program_day_${dayIndex}">Номер дня</label>
                <input type="number" id="program_day_${dayIndex}" class="form-input" placeholder="Номер дня (например, 1, 2, 3...)" min="1" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="program_programm_${dayIndex}">Программа дня</label>
                <textarea id="program_programm_${dayIndex}" class="form-textarea" placeholder="Опишите программу этого дня" style="min-height: 100px;" required></textarea>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label" for="program_image_${dayIndex}">Изображение для дня</label>
            <input type="file" id="program_image_${dayIndex}" name="programImage_${dayIndex}" accept="image/*" class="form-input" onchange="handleProgramImageSelect(${dayIndex}, this)">
            <div id="program_image_preview_${dayIndex}" class="image-preview" style="margin-top: 10px; display: none;">
                <img id="program_image_preview_img_${dayIndex}" src="" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
            </div>
        </div>
    `;
    
    container.appendChild(dayItem);
}

// Удалить день программы
function removeProgramDay(dayIndex) {
    const item = document.querySelector(`.program-day-item[data-day-index="${dayIndex}"]`);
    if (item) {
        item.remove();
    }
}

// Добавить элемент включения/исключения
function addInclusionItem(type) {
    const containerId = `inclusions-${type}-container`;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const itemIndex = inclusionCounter++;
    const item = document.createElement('div');
    item.className = 'inclusion-item';
    item.dataset.inclusionIndex = itemIndex;
    item.dataset.inclusionType = type;
    
    const label = type === 'included' ? 'Что входит' : 'Не входит';
    
    item.innerHTML = `
        <div class="inclusion-item-header">
            <div class="inclusion-item-title">${label}</div>
            <button type="button" class="btn-remove-inclusion" onclick="removeInclusionItem(${itemIndex})">Удалить</button>
        </div>
        <div class="form-group">
            <label class="form-label" for="inclusion_item_${itemIndex}">Элемент</label>
            <input type="text" id="inclusion_item_${itemIndex}" class="form-input" placeholder="Введите элемент включения/исключения" required>
        </div>
    `;
    
    container.appendChild(item);
}

// Удалить элемент включения/исключения
function removeInclusionItem(itemIndex) {
    const item = document.querySelector(`.inclusion-item[data-inclusion-index="${itemIndex}"]`);
    if (item) {
        item.remove();
    }
}

// Добавить поле цены
function addPriceField() {
    const container = document.getElementById('prices-container');
    if (!container) return;
    
    const priceIndex = priceCounter++;
    const priceItem = document.createElement('div');
    priceItem.className = 'price-item';
    priceItem.dataset.priceIndex = priceIndex;
    
    priceItem.innerHTML = `
        <div class="price-item-header">
            <div class="price-item-title">Цена ${priceIndex + 1}</div>
            <button type="button" class="btn-remove-price" onclick="removePriceField(${priceIndex})">Удалить</button>
        </div>
        <div class="price-item-row" style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
            <div class="form-group">
                <label class="form-label" for="price_value_${priceIndex}">Цена (€)</label>
                <input type="number" id="price_value_${priceIndex}" class="form-input" placeholder="Введите цену" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="price_description_${priceIndex}">Описание</label>
                <input type="text" id="price_description_${priceIndex}" class="form-input" placeholder="Например: Взрослый, Детский и т.д.">
            </div>
        </div>
    `;
    
    container.appendChild(priceItem);
}

// Удалить поле цены
function removePriceField(priceIndex) {
    const item = document.querySelector(`.price-item[data-price-index="${priceIndex}"]`);
    if (item) {
        item.remove();
    }
}

// Обработка выбора изображения
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Обработка выбора изображения для дня программы
function handleProgramImageSelect(dayIndex, input) {
    const file = input.files[0];
    const previewContainer = document.getElementById(`program_image_preview_${dayIndex}`);
    const previewImg = document.getElementById(`program_image_preview_img_${dayIndex}`);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImg) {
                previewImg.src = e.target.result;
            }
            if (previewContainer) {
                previewContainer.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    } else {
        // Если файл не выбран, показываем существующее изображение (если есть)
        const existingImage = input.dataset.existingImage;
        if (existingImage && previewImg) {
            previewImg.src = existingImage;
            if (previewContainer) {
                previewContainer.style.display = existingImage ? 'block' : 'none';
            }
        } else if (previewContainer) {
            previewContainer.style.display = 'none';
        }
    }
}

// Хранилище для новых изображений галереи
let galleryNewImages = [];
let galleryExistingImages = [];
// Счетчики уже объявлены выше, не объявляем повторно

// Обработка выбора изображений для галереи
function handleGallerySelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const preview = document.getElementById('galleryPreview');
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageId = Date.now() + Math.random();
            galleryNewImages.push({
                id: imageId,
                file: file,
                preview: event.target.result
            });
            
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.imageId = imageId;
            galleryItem.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <button type="button" class="gallery-item-remove" onclick="removeGalleryNewImage('${imageId}')">×</button>
            `;
            preview.appendChild(galleryItem);
        };
        reader.readAsDataURL(file);
    });
    
    // Очищаем input для возможности повторного выбора тех же файлов
    e.target.value = '';
}

// Удаление нового изображения из галереи (еще не загруженного)
function removeGalleryNewImage(imageId) {
    galleryNewImages = galleryNewImages.filter(img => img.id !== imageId);
    const item = document.querySelector(`.gallery-item[data-image-id="${imageId}"]`);
    if (item) {
        item.remove();
    }
}

// Удаление существующего изображения из галереи
async function removeGalleryImage(imageId, tourId) {
    if (!confirm('Удалить это изображение из галереи?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tours/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления изображения');
        }
        
        // Удаляем из массива
        galleryExistingImages = galleryExistingImages.filter(img => img.id !== imageId);
        
        // Удаляем из DOM
        const item = document.querySelector(`.gallery-uploaded-item[data-image-id="${imageId}"]`);
        if (item) {
            item.remove();
        }
        
        if (typeof showSuccess !== 'undefined') {
            showSuccess('Изображение удалено');
        }
    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        if (typeof showError !== 'undefined') {
            showError('Ошибка при удалении изображения');
        }
    }
}

// Обработка отправки формы тура
async function handleTourSubmit(e) {
    e.preventDefault();
    
    // Валидация формы
    if (typeof validateForm !== 'undefined' && !validateForm(e.target)) {
        if (typeof showWarning !== 'undefined') {
            showWarning('Пожалуйста, заполните все обязательные поля корректно');
        }
        return;
    }
    
    const formData = new FormData(e.target);
    const tourId = e.target.dataset.tourId;
    
    // Собираем программу тура из динамических полей
    const programs = [];
    const programItems = document.querySelectorAll('.program-day-item');
    programItems.forEach(item => {
        const dayIndex = item.dataset.dayIndex;
        const dayInput = document.getElementById(`program_day_${dayIndex}`);
        const programmInput = document.getElementById(`program_programm_${dayIndex}`);
        const imageInput = document.getElementById(`program_image_${dayIndex}`);
        
        if (dayInput && programmInput && dayInput.value && programmInput.value.trim()) {
            const programData = {
                day: parseInt(dayInput.value),
                programm: programmInput.value.trim(),
                dayIndex: dayIndex
            };
            
            // Если есть существующее изображение (из загруженного тура), сохраняем его URL
            const existingImageUrl = imageInput?.dataset.existingImage;
            if (existingImageUrl) {
                programData.image_url = existingImageUrl;
            }
            
            programs.push(programData);
            
            // Добавляем файл изображения в FormData, если он выбран
            if (imageInput && imageInput.files && imageInput.files[0]) {
                formData.append(`programImage_${dayIndex}`, imageInput.files[0]);
            }
        }
    });
    
    // Добавляем программы в FormData как JSON строку
    if (programs.length > 0) {
        formData.append('programs', JSON.stringify(programs));
    }

    // Собираем включения/исключения из динамических полей
    const inclusions = [];
    const inclusionItems = document.querySelectorAll('.inclusion-item');
    inclusionItems.forEach(item => {
        const inclusionIndex = item.dataset.inclusionIndex;
        const type = item.dataset.inclusionType;
        const itemInput = document.getElementById(`inclusion_item_${inclusionIndex}`);
        
        if (itemInput && itemInput.value && itemInput.value.trim()) {
            inclusions.push({
                item: itemInput.value.trim(),
                type: type
            });
        }
    });
    
    // Добавляем включения/исключения в FormData как JSON строку
    if (inclusions.length > 0) {
        formData.append('inclusions', JSON.stringify(inclusions));
    }

    // Собираем цены из динамических полей
    const prices = [];
    const priceItems = document.querySelectorAll('.price-item');
    priceItems.forEach((item, index) => {
        const priceIndex = item.dataset.priceIndex;
        const priceInput = document.getElementById(`price_value_${priceIndex}`);
        const descriptionInput = document.getElementById(`price_description_${priceIndex}`);
        
        if (priceInput && priceInput.value) {
            prices.push({
                price: parseInt(priceInput.value),
                currency: 'EUR', // Всегда используем EUR
                description: descriptionInput ? descriptionInput.value.trim() : null,
                price_order: index
            });
        }
    });
    
    // Добавляем цены в FormData как JSON строку
    if (prices.length > 0) {
        formData.append('prices', JSON.stringify(prices));
    }
    
    try {
        const url = tourId ? `${API_URL}/tours/${tourId}` : `${API_URL}/tours`;
        const method = tourId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            // Если 403 - токен недействителен, перенаправляем на логин
            if (response.status === 403 || response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login.html';
                return;
            }
            
            // Получаем детали ошибки
            let errorMessage = 'Ошибка сохранения тура';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        const savedTourId = tourId || result.id;
        
        // Загружаем новые изображения в галерею
        if (galleryNewImages.length > 0 && savedTourId) {
            await uploadGalleryImages(savedTourId);
        }
        
        cancelTourForm();
        loadTours();
        if (typeof showSuccess !== 'undefined') {
            showSuccess('Тур успешно сохранен!');
        } else {
            alert('Тур успешно сохранен!');
        }
            } catch (error) {
                console.error('Ошибка:', error);
                const errorMessage = error.message || 'Ошибка при сохранении тура';
                if (typeof showError !== 'undefined') {
                    showError(errorMessage);
                } else {
                    alert(errorMessage);
                }
            }
}

// Получить режим отображения из localStorage
function getViewMode() {
    return localStorage.getItem('toursViewMode') || 'grid';
}

// Установить режим отображения
function setViewMode(mode) {
    localStorage.setItem('toursViewMode', mode);
    loadTours();
    updateViewButtons();
}

// Обновить кнопки переключения вида
function updateViewButtons() {
    const mode = getViewMode();
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    
    if (gridBtn) {
        gridBtn.classList.toggle('active', mode === 'grid');
    }
    if (listBtn) {
        listBtn.classList.toggle('active', mode === 'list');
    }
}

// Загрузка туров
async function loadTours() {
    try {
        console.log('Загрузка туров...');
        const list = document.getElementById('tours-list');
        if (!list) {
            console.error('Элемент tours-list не найден!');
            return;
        }
        
        // Показываем индикатор загрузки
        list.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">Загрузка туров...</p>';
        
        // GET /api/tours - публичный endpoint, не требует авторизации
        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        console.log('Отправка запроса к', `${API_URL}/tours`);
        const response = await fetch(`${API_URL}/tours`, {
            headers: headers
        });
        
        console.log('Ответ получен:', response.status, response.statusText);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Токен истек или невалидный - но не блокируем просмотр
                console.warn('Токен невалидный, продолжаем без авторизации');
                authToken = null;
                localStorage.removeItem('authToken');
            } else {
                const errorText = await response.text().catch(() => 'Неизвестная ошибка');
                console.error('Ошибка загрузки туров:', errorText);
                list.innerHTML = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">Ошибка загрузки туров: ${response.status} ${response.statusText}</p>`;
                return;
            }
        }
        
        const tours = await response.json();
        console.log('Туры получены:', tours?.length || 0, 'туров');
        
        if (!tours || (Array.isArray(tours) && tours.length === 0)) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">Туры не найдены</p>';
            return;
        }
        
        const viewMode = getViewMode();
        const containerClass = viewMode === 'grid' ? 'tours-grid' : 'tours-list';
        const cardClass = viewMode === 'grid' ? 'tour-card-grid' : 'tour-card-list';
        
        list.className = containerClass;
        
        // Очищаем список перед заполнением
        list.innerHTML = '';
        
        // Создаем контейнер для туров
        // Генерируем HTML для туров
        const toursHTML = tours.map(tour => {
            // Правильно формируем путь к изображению
            let imageUrl = '';
            if (tour.image_url) {
                imageUrl = tour.image_url.startsWith('/') ? tour.image_url : `/${tour.image_url}`;
            }
            
            if (viewMode === 'grid') {
                // Вид сетки - вертикальный layout
                return `
                <div class="${cardClass}">
                    ${imageUrl ? `
                    <div class="tour-card-grid-image">
                        <img src="${imageUrl}" alt="${tour.title || 'Тур'}" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'350\' height=\'200\'%3E%3Crect fill=\'%23333\' width=\'350\' height=\'200\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'14\' dy=\'10.5\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'%3EНет изображения%3C/text%3E%3C/svg%3E';">
                    </div>
                    ` : '<div class="tour-card-grid-image" style="background-color: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3);">Нет изображения</div>'}
                    <div class="tour-card-grid-content">
                        <h3 style="font-size: 20px; font-weight: 500; margin-bottom: 12px; line-height: 1.3;">${tour.title || 'Без названия'}</h3>
                        <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 12px; line-height: 1.5;">
                            ${tour.location || ''} ${tour.location && tour.duration ? '•' : ''} ${tour.duration || ''}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
                            ${(() => {
                                let displayPrice = null;
                                if (tour.prices && tour.prices.length > 0) {
                                    displayPrice = Math.min(...tour.prices.map(p => p.price || 0));
                                } else if (tour.price) {
                                    displayPrice = tour.price;
                                }
                                return displayPrice ? `<p style="color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 600; margin: 0;">${parseInt(displayPrice).toLocaleString('ru-RU')} €</p>` : '<p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0;">Цена не указана</p>';
                            })()}
                            ${tour.status ? `<span style="display: inline-block; padding: 4px 12px; background-color: ${tour.status === 'active' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(158, 158, 158, 0.2)'}; color: ${tour.status === 'active' ? '#4CAF50' : '#9E9E9E'}; border-radius: 8px; font-size: 12px; font-weight: 500;">
                                ${tour.status === 'active' ? 'Активный' : 'Неактивный'}
                            </span>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: auto;">
                            <button class="btn btn-save" style="flex: 1; padding: 10px 16px; font-size: 14px;" onclick="editTour(${tour.id})">Редактировать</button>
                            <button class="btn btn-cancel" style="flex: 1; padding: 10px 16px; font-size: 14px;" onclick="deleteTour(${tour.id})">Удалить</button>
                        </div>
                    </div>
                </div>
                `;
            } else {
                // Вид списка
                return `
                <div class="${cardClass}">
                    <div class="tour-content">
                        ${imageUrl ? `
                        <div class="tour-image-container">
                            <img src="${imageUrl}" alt="${tour.title || 'Тур'}" 
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\'%3E%3Crect fill=\'%23333\' width=\'150\' height=\'150\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'12\' dy=\'10.5\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'%3EНет изображения%3C/text%3E%3C/svg%3E';">
                        </div>
                        ` : '<div class="tour-image-container"></div>'}
                        <div class="tour-info">
                            <h3 style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">${tour.title || 'Без названия'}</h3>
                            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 6px;">
                                ${tour.location || ''} ${tour.location && tour.duration ? '•' : ''} ${tour.duration || ''}
                            </p>
                            ${(() => {
                                let displayPrice = null;
                                if (tour.prices && tour.prices.length > 0) {
                                    displayPrice = Math.min(...tour.prices.map(p => p.price || 0));
                                } else if (tour.price) {
                                    displayPrice = tour.price;
                                }
                                return displayPrice ? `<p style="color: rgba(255,255,255,0.8); font-size: 16px; font-weight: 500; margin-bottom: 6px;">${parseInt(displayPrice).toLocaleString('ru-RU')} €</p>` : '';
                            })()}
                            ${tour.status ? `<p style="display: inline-block; padding: 4px 12px; background-color: ${tour.status === 'active' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(158, 158, 158, 0.2)'}; color: ${tour.status === 'active' ? '#4CAF50' : '#9E9E9E'}; border-radius: 8px; font-size: 12px; font-weight: 500;">
                                ${tour.status === 'active' ? 'Активный' : 'Неактивный'}
                            </p>` : ''}
                        </div>
                        <div class="tour-actions">
                            <button class="btn btn-save" style="padding: 8px 16px; font-size: 14px; white-space: nowrap;" onclick="editTour(${tour.id})">Редактировать</button>
                            <button class="btn btn-cancel" style="padding: 8px 16px; font-size: 14px; white-space: nowrap;" onclick="deleteTour(${tour.id})">Удалить</button>
                        </div>
                    </div>
                </div>
                `;
            }
        }).join('');
        
        // Вставляем сгенерированный HTML
        list.innerHTML = toursHTML;
        
        updateViewButtons();
    } catch (error) {
        console.error('Ошибка загрузки туров:', error);
        const list = document.getElementById('tours-list');
        if (list) {
            list.innerHTML = `<p style="color: #f44336; padding: 20px; background: rgba(244, 67, 54, 0.1); border-radius: 8px; border: 1px solid rgba(244, 67, 54, 0.3);">
                Ошибка загрузки туров: ${error.message || 'Неизвестная ошибка'}<br>
                <small style="opacity: 0.7;">Проверьте консоль браузера для подробностей</small>
            </p>`;
        }
    }
}

// Редактирование тура
async function editTour(id) {
    try {
        const response = await fetch(`${API_URL}/tours/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`Ошибка загрузки тура: ${response.status} ${response.statusText}`);
        }
        
        const tour = await response.json();
        
        document.getElementById('title').value = tour.title || '';
        document.getElementById('price').value = tour.price || '';
        document.getElementById('location').value = tour.location || '';
        document.getElementById('duration').value = tour.duration || '';
        document.getElementById('date_start').value = tour.date_start || '';
        document.getElementById('date_end').value = tour.date_end || '';
        document.getElementById('max_participants').value = tour.max_participants || '';
        document.getElementById('status').value = tour.status || 'active';
        document.getElementById('short_description').value = tour.short_description || '';
        document.getElementById('description').value = tour.description || '';
        
        // Очищаем контейнеры
        const programsContainer = document.getElementById('programs-container');
        const inclusionsIncludedContainer = document.getElementById('inclusions-included-container');
        const inclusionsExcludedContainer = document.getElementById('inclusions-excluded-container');
        const pricesContainer = document.getElementById('prices-container');
        
        programsContainer.innerHTML = '';
        if (inclusionsIncludedContainer) inclusionsIncludedContainer.innerHTML = '';
        if (inclusionsExcludedContainer) inclusionsExcludedContainer.innerHTML = '';
        if (pricesContainer) pricesContainer.innerHTML = '';
        
        programDayCounter = 0;
        inclusionCounter = 0;
        priceCounter = 0;
        
        // Загружаем программы тура
        if (tour.programs && tour.programs.length > 0) {
            tour.programs.forEach(program => {
                const dayIndex = programDayCounter++;
                const dayItem = document.createElement('div');
                dayItem.className = 'program-day-item';
                dayItem.dataset.dayIndex = dayIndex;
                
                const imageUrl = program.image_url || '';
                const hasImage = imageUrl ? 'block' : 'none';
                dayItem.innerHTML = `
                    <div class="program-day-item-header">
                        <div class="program-day-item-title">День ${dayIndex + 1}</div>
                        <button type="button" class="btn-remove-day" onclick="removeProgramDay(${dayIndex})">Удалить</button>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="program_day_${dayIndex}">Номер дня</label>
                            <input type="number" id="program_day_${dayIndex}" class="form-input" placeholder="Номер дня (например, 1, 2, 3...)" min="1" value="${program.day || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="program_programm_${dayIndex}">Программа дня</label>
                            <textarea id="program_programm_${dayIndex}" class="form-textarea" placeholder="Опишите программу этого дня" style="min-height: 100px;" required>${program.programm || ''}</textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="program_image_${dayIndex}">Изображение для дня</label>
                        <input type="file" id="program_image_${dayIndex}" name="programImage_${dayIndex}" accept="image/*" class="form-input" data-existing-image="${imageUrl}" onchange="handleProgramImageSelect(${dayIndex}, this)">
                        <div id="program_image_preview_${dayIndex}" class="image-preview" style="margin-top: 10px; display: ${hasImage};">
                            <img id="program_image_preview_img_${dayIndex}" src="${imageUrl}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                        </div>
                    </div>
                `;
                
                programsContainer.appendChild(dayItem);
            });
        }

        // Загружаем включения/исключения тура
        if (tour.inclusions && tour.inclusions.length > 0) {
            tour.inclusions.forEach(inclusion => {
                const itemIndex = inclusionCounter++;
                const item = document.createElement('div');
                item.className = 'inclusion-item';
                item.dataset.inclusionIndex = itemIndex;
                item.dataset.inclusionType = inclusion.type;
                
                const label = inclusion.type === 'included' ? 'Что входит' : 'Не входит';
                const container = inclusion.type === 'included' ? inclusionsIncludedContainer : inclusionsExcludedContainer;
                
                item.innerHTML = `
                    <div class="inclusion-item-header">
                        <div class="inclusion-item-title">${label}</div>
                        <button type="button" class="btn-remove-inclusion" onclick="removeInclusionItem(${itemIndex})">Удалить</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="inclusion_item_${itemIndex}">Элемент</label>
                        <input type="text" id="inclusion_item_${itemIndex}" class="form-input" placeholder="Введите элемент включения/исключения" value="${inclusion.item || ''}" required>
                    </div>
                `;
                
                if (container) {
                    container.appendChild(item);
                }
            });
        }

        // Загружаем цены тура
        if (tour.prices && tour.prices.length > 0) {
            tour.prices.forEach(price => {
                const priceIndex = priceCounter++;
                const priceItem = document.createElement('div');
                priceItem.className = 'price-item';
                priceItem.dataset.priceIndex = priceIndex;
                
                priceItem.innerHTML = `
                    <div class="price-item-header">
                        <div class="price-item-title">Цена ${priceIndex + 1}</div>
                        <button type="button" class="btn-remove-price" onclick="removePriceField(${priceIndex})">Удалить</button>
                    </div>
                    <div class="price-item-row" style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
                        <div class="form-group">
                            <label class="form-label" for="price_value_${priceIndex}">Цена (€)</label>
                            <input type="number" id="price_value_${priceIndex}" class="form-input" placeholder="Введите цену" value="${price.price || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="price_description_${priceIndex}">Описание</label>
                            <input type="text" id="price_description_${priceIndex}" class="form-input" placeholder="Например: Взрослый, Детский и т.д." value="${price.description || ''}">
                        </div>
                    </div>
                `;
                
                if (pricesContainer) {
                    pricesContainer.appendChild(priceItem);
                }
            });
        }
        
        if (tour.image_url) {
            const imageUrl = tour.image_url.startsWith('/') ? tour.image_url : `/${tour.image_url}`;
            document.getElementById('imagePreview').innerHTML = `<img src="${imageUrl}" alt="Preview" style="max-width: 100%; border-radius: 8px;">`;
            document.getElementById('fileName').textContent = 'Текущее изображение';
        }
        
        // Загружаем существующие изображения галереи
        await loadTourGallery(id);
        
        document.getElementById('tourForm').dataset.tourId = id;
        document.getElementById('tour-form').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки тура:', error);
    }
}

// Удаление тура
async function deleteTour(id) {
    if (typeof showConfirm !== 'undefined') {
        showConfirm('Вы уверены, что хотите удалить этот тур?', async () => {
            await performDeleteTour(id);
        });
    } else {
        if (!confirm('Вы уверены, что хотите удалить этот тур?')) {
            return;
        }
        await performDeleteTour(id);
    }
}

async function performDeleteTour(id) {
    try {
        const response = await fetch(`${API_URL}/tours/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления тура');
        }
        
        loadTours();
        if (typeof showSuccess !== 'undefined') {
            showSuccess('Тур успешно удален!');
        } else {
            alert('Тур успешно удален!');
        }
    } catch (error) {
        console.error('Ошибка удаления тура:', error);
        if (typeof showError !== 'undefined') {
            showError('Ошибка при удалении тура');
        } else {
            alert('Ошибка при удалении тура');
        }
    }
}

// Загрузка заявок
async function loadApplications() {
    try {
        const response = await fetch(`${API_URL}/applications`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`Ошибка загрузки заявок: ${response.status} ${response.statusText}`);
        }
        
        const applications = await response.json();
        
        const list = document.getElementById('applications-list');
        if (!list) return;
        
        if (!applications || (Array.isArray(applications) && applications.length === 0)) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Заявки не найдены</p>';
            return;
        }
        
        // Группируем по статусу
        const newApps = applications.filter(app => app.status === 'new');
        const processedApps = applications.filter(app => app.status !== 'new');
        
        list.innerHTML = `
            ${newApps.length > 0 ? `
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 18px; font-weight: 500; margin-bottom: 16px; color: #4CAF50;">
                    Новые заявки (${newApps.length})
                </h3>
                ${renderApplicationsList(newApps)}
            </div>
            ` : ''}
            ${processedApps.length > 0 ? `
            <div>
                <h3 style="font-size: 18px; font-weight: 500; margin-bottom: 16px;">
                    Обработанные заявки (${processedApps.length})
                </h3>
                ${renderApplicationsList(processedApps)}
            </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        const list = document.getElementById('applications-list');
        if (list) {
            list.innerHTML = `<p style="color: #f44336; padding: 20px; background: rgba(244, 67, 54, 0.1); border-radius: 8px; border: 1px solid rgba(244, 67, 54, 0.3);">
                Ошибка загрузки заявок: ${error.message || 'Неизвестная ошибка'}<br>
                <small style="opacity: 0.7;">Проверьте консоль браузера для подробностей</small>
            </p>`;
        }
    }
}

// Экспорт заявок
async function exportApplications(status = 'all') {
    try {
        const url = `${API_URL}/applications/export?format=csv&status=${status === 'new' ? 'new' : ''}`;
        
        // Используем fetch для получения файла с авторизацией
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка экспорта заявок');
        }
        
        // Получаем blob и создаем ссылку для скачивания
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `applications-${status}-${Date.now()}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        if (typeof showSuccess !== 'undefined') {
            showSuccess('Экспорт завершен. Файл загружен.');
        }
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        if (typeof showError !== 'undefined') {
            showError('Ошибка при экспорте заявок');
        }
    }
}

// Рендеринг списка заявок
function renderApplicationsList(applications) {
    return applications.map(app => `
        <div class="application-card" onclick="openApplicationModal(${app.id})" data-application-id="${app.id}">
            <div class="application-card-content">
                <div class="application-card-info">
                    <h3 style="font-size: 18px; font-weight: 500; margin-bottom: 12px; color: #ffffff;">${app.name || 'Без имени'}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
                        <p style="color: rgba(255,255,255,0.8); margin: 0;">📞 ${app.phone || 'Не указан'}</p>
                        <p style="color: rgba(255,255,255,0.8); margin: 0;">✉️ ${app.email || 'Не указан'}</p>
                        ${app.tour_title ? `<p style="color: rgba(255,255,255,0.8); margin: 0;">🎯 Тур: ${app.tour_title}</p>` : ''}
                        <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 14px;">📅 ${new Date(app.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    ${app.message ? `<p style="color: rgba(255,255,255,0.6); margin-top: 12px; padding: 12px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${app.message}</p>` : ''}
                </div>
                <div class="application-card-actions" onclick="event.stopPropagation();">
                    <select onchange="updateApplicationStatus(${app.id}, this.value)" class="application-status-select" style="padding: 8px 12px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; font-size: 14px; min-width: 150px;">
                        <option value="new" ${app.status === 'new' ? 'selected' : ''}>Новая</option>
                        <option value="processed" ${app.status === 'processed' ? 'selected' : ''}>Обработана</option>
                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Отклонена</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

// Обновление статуса заявки
async function updateApplicationStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/applications/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка обновления статуса');
        }
        
        loadApplications();
        if (typeof showSuccess !== 'undefined') {
            showSuccess('Статус заявки обновлен');
        }
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        if (typeof showError !== 'undefined') {
            showError('Ошибка при обновлении статуса');
        }
    }
}

// Отметить заявку как обработанную (для обратной совместимости)
async function markAsProcessed(id) {
    await updateApplicationStatus(id, 'processed');
}

// Загрузка статистики
async function loadStats() {
    try {
        const periodSelect = document.getElementById('stats-period');
        const period = periodSelect ? periodSelect.value : '30';
        
        const response = await fetch(`${API_URL}/stats?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`Ошибка загрузки статистики: ${response.status} ${response.statusText}`);
        }
        
        const stats = await response.json();
        
        const content = document.getElementById('stats-content');
        if (!content) return;
        
        if (!stats) {
            content.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Статистика недоступна</p>';
            return;
        }
        
        // Форматируем числа
        const formatNumber = (num) => (num || 0).toLocaleString('ru-RU');
        
        content.innerHTML = `
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="font-size: 18px; font-weight: 500;">Общая статистика</h3>
                    <select id="stats-period" onchange="loadStats()" style="padding: 8px 16px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; font-size: 14px;">
                        <option value="7">За 7 дней</option>
                        <option value="30" selected>За 30 дней</option>
                        <option value="90">За 90 дней</option>
                        <option value="365">За год</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h4 style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 16px;">Заявки по дням</h4>
                        <canvas id="applicationsChart" style="max-height: 200px;"></canvas>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h4 style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 16px;">Просмотры туров</h4>
                        <canvas id="viewsChart" style="max-height: 200px;"></canvas>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Активных туров</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.active_tours || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Всего туров</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.total_tours || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Новых заявок</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px; color: #4CAF50;">${formatNumber(stats.new_applications || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Всего заявок</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.total_applications || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Заявок за период</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.applications_period || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Подписчиков</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.active_subscriptions || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Просмотров туров</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.tour_views_period || 0)}</p>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <h3 style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Отправок форм</h3>
                        <p style="font-size: 36px; font-weight: 600; margin-bottom: 8px;">${formatNumber(stats.form_submits_period || 0)}</p>
                    </div>
                </div>
            </div>
            
            ${stats.top_tours && stats.top_tours.length > 0 ? `
            <div style="margin-top: 40px;">
                <h3 style="font-size: 18px; font-weight: 500; margin-bottom: 20px;">Топ-10 туров по просмотрам</h3>
                <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                    <div style="display: grid; gap: 12px;">
                        ${stats.top_tours.map((tour, index) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.4); min-width: 24px;">#${index + 1}</span>
                                        <span style="font-size: 16px; font-weight: 500;">${tour.title || 'Без названия'}</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 24px; align-items: center;">
                                    <div style="text-align: right;">
                                        <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Просмотры</div>
                                        <div style="font-size: 18px; font-weight: 600;">${formatNumber(tour.views_count || 0)}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Заявки</div>
                                        <div style="font-size: 18px; font-weight: 600;">${formatNumber(tour.applications_count || 0)}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
        `;
        
        // Устанавливаем выбранный период при первой загрузке
        const periodSelectEl = document.getElementById('stats-period');
        if (periodSelectEl && !periodSelectEl.value) {
            const urlParams = new URLSearchParams(window.location.search);
            const period = urlParams.get('period') || '30';
            periodSelectEl.value = period;
        }
        
        // Инициализируем графики после небольшой задержки для рендеринга DOM
        setTimeout(() => {
            initCharts(stats);
        }, 100);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        const content = document.getElementById('stats-content');
        if (content) {
            content.innerHTML = `<p style="color: #f44336; padding: 20px; background: rgba(244, 67, 54, 0.1); border-radius: 8px; border: 1px solid rgba(244, 67, 54, 0.3);">
                Ошибка загрузки статистики: ${error.message || 'Неизвестная ошибка'}<br>
                <small style="opacity: 0.7;">Проверьте консоль браузера для подробностей</small>
            </p>`;
        }
    }
}

// Инициализация графиков
function initCharts(stats) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js не загружен');
        return;
    }
    
    // График заявок
    const applicationsCtx = document.getElementById('applicationsChart');
    if (applicationsCtx) {
        const applicationsData = stats.applications_by_day || [];
        new Chart(applicationsCtx, {
            type: 'line',
            data: {
                labels: applicationsData.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                }),
                datasets: [{
                    label: 'Заявки',
                    data: applicationsData.map(item => item.count || 0),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }
    
    // График просмотров
    const viewsCtx = document.getElementById('viewsChart');
    if (viewsCtx) {
        const viewsData = stats.views_by_day || [];
        new Chart(viewsCtx, {
            type: 'bar',
            data: {
                labels: viewsData.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                }),
                datasets: [{
                    label: 'Просмотры',
                    data: viewsData.map(item => item.count || 0),
                    backgroundColor: 'rgba(255, 87, 51, 0.6)',
                    borderColor: '#ff5733',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }
}

// Загрузка информации об администраторе
async function loadAdminInfo() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`Ошибка загрузки информации об администраторе: ${response.status} ${response.statusText}`);
        }
        
        const admin = await response.json();
        
        const usernameInput = document.getElementById('admin-username');
        const createdInput = document.getElementById('admin-created');
        
        if (usernameInput) {
            usernameInput.value = admin.username || '';
        }
        
        if (createdInput && admin.created_at) {
            const date = new Date(admin.created_at);
            createdInput.value = date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки информации об администраторе:', error);
    }
}

// Обработка смены пароля
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageEl = document.getElementById('password-message');
    
    // Проверка совпадения паролей
    if (newPassword !== confirmPassword) {
        messageEl.textContent = 'Новые пароли не совпадают';
        messageEl.style.display = 'block';
        messageEl.style.color = '#ff6b35';
        return;
    }
    
    // Проверка минимальной длины
    if (newPassword.length < 6) {
        messageEl.textContent = 'Новый пароль должен содержать минимум 6 символов';
        messageEl.style.display = 'block';
        messageEl.style.color = '#ff6b35';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка изменения пароля');
        }
        
        messageEl.textContent = 'Пароль успешно изменен';
        messageEl.style.display = 'block';
        messageEl.style.color = '#4CAF50';
        
        // Очищаем форму
        resetPasswordForm();
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.style.display = 'block';
        messageEl.style.color = '#ff6b35';
    }
}

// Сброс формы пароля
function resetPasswordForm() {
    document.getElementById('passwordForm').reset();
    const messageEl = document.getElementById('password-message');
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}

// Открытие модального окна с детальной информацией о заявке
async function openApplicationModal(applicationId) {
    try {
        const response = await fetch(`${API_URL}/applications/${applicationId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки заявки');
        }
        
        const app = await response.json();
        
        // Форматируем телефон для ссылок
        let phone = app.phone ? app.phone.replace(/\D/g, '') : '';
        const phoneFormatted = app.phone || 'Не указан';
        
        // Для Telegram нужен формат без +, но если номер начинается с 7 (Россия), заменяем на 7
        // Telegram использует формат: https://t.me/+7XXXXXXXXXX или https://t.me/username
        // Для WhatsApp используем формат: https://wa.me/7XXXXXXXXXX
        let whatsappUrl = '#';
        let telegramUrl = '#';
        let phoneUrl = '#';
        
        if (phone) {
            // Если номер начинается с 8, заменяем на 7
            if (phone.startsWith('8') && phone.length === 11) {
                phone = '7' + phone.substring(1);
            }
            // Если номер не начинается с кода страны, добавляем 7 для России
            if (phone.length === 10) {
                phone = '7' + phone;
            }
            
            whatsappUrl = `https://wa.me/${phone}`;
            telegramUrl = `https://t.me/+${phone}`;
            phoneUrl = `tel:+${phone}`;
        }
        
        // Форматируем дату
        const dateFormatted = new Date(app.created_at).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Определяем статус
        const statusLabels = {
            'new': 'Новая',
            'processed': 'Обработана',
            'rejected': 'Отклонена'
        };
        const statusLabel = statusLabels[app.status] || app.status;
        
        // Создаем HTML для модального окна
        const modalBody = document.getElementById('application-modal-body');
        modalBody.innerHTML = `
            <div class="application-info-item">
                <div class="application-info-label">Имя</div>
                <div class="application-info-value">${app.name || 'Не указано'}</div>
            </div>
            
            <div class="application-info-item">
                <div class="application-info-label">Телефон</div>
                <div class="application-info-value">
                    ${phoneFormatted}
                    ${phone ? `<a href="${phoneUrl}" style="margin-left: 12px; color: #ff6b35; text-decoration: none;">📞 Позвонить</a>` : ''}
                </div>
            </div>
            
            ${app.email ? `
            <div class="application-info-item">
                <div class="application-info-label">Email</div>
                <div class="application-info-value">
                    <a href="mailto:${app.email}" style="color: #ff6b35; text-decoration: none;">${app.email}</a>
                </div>
            </div>
            ` : ''}
            
            ${app.tour_title ? `
            <div class="application-info-item">
                <div class="application-info-label">Тур</div>
                <div class="application-info-value">${app.tour_title}</div>
            </div>
            ` : ''}
            
            ${app.direction ? `
            <div class="application-info-item">
                <div class="application-info-label">Направление</div>
                <div class="application-info-value">${app.direction}</div>
            </div>
            ` : ''}
            
            <div class="application-info-item">
                <div class="application-info-label">Статус</div>
                <div class="application-info-value">
                    <select onchange="updateApplicationStatus(${app.id}, this.value); closeApplicationModal(); setTimeout(() => loadApplications(), 500);" class="application-status-select" style="padding: 8px 12px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; font-size: 14px; min-width: 150px;">
                        <option value="new" ${app.status === 'new' ? 'selected' : ''}>Новая</option>
                        <option value="processed" ${app.status === 'processed' ? 'selected' : ''}>Обработана</option>
                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Отклонена</option>
                    </select>
                </div>
            </div>
            
            <div class="application-info-item">
                <div class="application-info-label">Дата создания</div>
                <div class="application-info-value">${dateFormatted}</div>
            </div>
            
            ${app.message ? `
            <div class="application-info-item">
                <div class="application-info-label">Сообщение</div>
                <div class="application-message">${app.message}</div>
            </div>
            ` : ''}
            
            ${phone ? `
            <div class="application-actions">
                <a href="${whatsappUrl}" target="_blank" class="btn-messenger btn-whatsapp" onclick="event.stopPropagation();">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                </a>
                <a href="${telegramUrl}" target="_blank" class="btn-messenger btn-telegram" onclick="event.stopPropagation();">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                </a>
                <a href="${phoneUrl}" class="btn-messenger btn-phone" onclick="event.stopPropagation();">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    Позвонить
                </a>
            </div>
            ` : ''}
        `;
        
        // Показываем модальное окно
        const modal = document.getElementById('application-modal');
        modal.classList.add('active');
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeApplicationModal();
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeApplicationModal();
            }
        });
        
    } catch (error) {
        console.error('Ошибка загрузки заявки:', error);
        if (typeof showError !== 'undefined') {
            showError('Ошибка загрузки заявки');
        }
    }
}

// Закрытие модального окна
function closeApplicationModal() {
    const modal = document.getElementById('application-modal');
    modal.classList.remove('active');
}

// Делаем функции глобальными для использования в onclick
if (typeof window !== 'undefined') {
    window.removeGalleryNewImage = removeGalleryNewImage;
    window.removeGalleryImage = removeGalleryImage;
    window.exportApplications = exportApplications;
    window.updateApplicationStatus = updateApplicationStatus;
    window.openApplicationModal = openApplicationModal;
    window.closeApplicationModal = closeApplicationModal;
}

// Выход из системы
function logout() {
    const performLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/admin/login.html';
    };
    
    if (typeof showConfirm !== 'undefined') {
        showConfirm('Вы уверены, что хотите выйти?', performLogout);
    } else {
        if (confirm('Вы уверены, что хотите выйти?')) {
            performLogout();
        }
    }
}

