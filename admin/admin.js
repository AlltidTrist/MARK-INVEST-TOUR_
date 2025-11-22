// Админ-панель JavaScript

const API_URL = '/api';
let authToken = localStorage.getItem('authToken');

// Проверка авторизации
if (!authToken) {
    window.location.href = '/admin/login.html';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTours();
    loadApplications();
    loadStats();
    loadAdminInfo();
    updateViewButtons();
    
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
                console.error('Ошибка загрузки изображения в галерею');
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
            throw new Error('Ошибка сохранения тура');
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
                if (typeof showError !== 'undefined') {
                    showError('Ошибка при сохранении тура');
                } else {
                    alert('Ошибка при сохранении тура');
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
        const response = await fetch(`${API_URL}/tours`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Токен истек или невалидный
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`Ошибка загрузки туров: ${response.status} ${response.statusText}`);
        }
        
        const tours = await response.json();
        
        const list = document.getElementById('tours-list');
        if (!list) return;
        
        if (!tours || (Array.isArray(tours) && tours.length === 0)) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Туры не найдены</p>';
            return;
        }
        
        const viewMode = getViewMode();
        const containerClass = viewMode === 'grid' ? 'tours-grid' : 'tours-list';
        const cardClass = viewMode === 'grid' ? 'tour-card-grid' : 'tour-card-list';
        
        list.className = containerClass;
        
        list.innerHTML = tours.map(tour => {
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
                            ${tour.price ? `<p style="color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 600; margin: 0;">${parseInt(tour.price).toLocaleString('ru-RU')} ₽</p>` : '<p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0;">Цена не указана</p>'}
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
                            ${tour.price ? `<p style="color: rgba(255,255,255,0.8); font-size: 16px; font-weight: 500; margin-bottom: 6px;">${parseInt(tour.price).toLocaleString('ru-RU')} ₽</p>` : ''}
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
        
        // Очищаем контейнер программ
        const programsContainer = document.getElementById('programs-container');
        programsContainer.innerHTML = '';
        programDayCounter = 0;
        
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
            if (response.status === 401) {
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
        <div style="background: linear-gradient(135deg, rgba(47, 48, 53, 1) 0%, rgba(31, 31, 31, 1) 100%); padding: 24px; border-radius: 16px; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3 style="font-size: 18px; font-weight: 500; margin-bottom: 12px;">${app.name || 'Без имени'}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
                        <p style="color: rgba(255,255,255,0.8); margin: 0;">📞 ${app.phone || 'Не указан'}</p>
                        <p style="color: rgba(255,255,255,0.8); margin: 0;">✉️ ${app.email || 'Не указан'}</p>
                        ${app.tour_title ? `<p style="color: rgba(255,255,255,0.8); margin: 0;">🎯 Тур: ${app.tour_title}</p>` : ''}
                        <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 14px;">📅 ${new Date(app.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    ${app.message ? `<p style="color: rgba(255,255,255,0.6); margin-top: 12px; padding: 12px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px;">${app.message}</p>` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-left: 20px;">
                    <select onchange="updateApplicationStatus(${app.id}, this.value)" style="padding: 8px 12px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; font-size: 14px; min-width: 150px;">
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
            if (response.status === 401) {
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
            throw new Error('Ошибка загрузки информации');
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

// Делаем функции глобальными для использования в onclick
if (typeof window !== 'undefined') {
    window.removeGalleryNewImage = removeGalleryNewImage;
    window.removeGalleryImage = removeGalleryImage;
    window.exportApplications = exportApplications;
    window.updateApplicationStatus = updateApplicationStatus;
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

