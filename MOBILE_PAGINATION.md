# Мобильная пагинация карточек туров

## Описание

На мобильных устройствах (экраны до 768px) карточки туров отображаются вертикально (друг под другом), по 6 карточек на странице, с пагинацией внизу.

## Реализация

### 1. Вертикальное расположение карточек

На мобильных устройствах полностью отключается grid и используется только flex для вертикального расположения:

```css
@media screen and (max-width: 768px) {
  /* Убираем grid, используем только flex */
  #rec1170228026 .tn-group[data-group-id="175278397639235650"] {
    display: flex !important;
    flex-direction: column !important; /* Вертикальное расположение */
    grid-template-columns: none !important; /* Отключаем grid */
  }
  
  /* Молекула с карточками - вертикальное расположение */
  #rec1170228026 .tn-group[data-group-id="175278397639235650"] .tn-molecule {
    display: flex !important;
    flex-direction: column !important;
    gap: 24px !important; /* Отступ между карточками */
    align-items: stretch !important; /* Растягиваем карточки на всю ширину */
  }
  
  /* Карточки - полная ширина, друг под другом */
  #rec1170228026 .travelCard[data-dynamic-card="true"] {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    flex-shrink: 0 !important; /* Не сжимаем карточки */
    align-self: stretch !important; /* Растягиваем на всю ширину */
  }
}
```

### 2. Количество карточек на странице

Установлено значение `toursPerPage = 6` в `api-integration.js`:

```javascript
window.toursPerPage = 6;
```

### 3. Пагинация

Пагинация автоматически создается функцией `createPagination()`, если туров больше 6:

```javascript
if (tours.length > window.toursPerPage) {
    createPagination(tours.length);
}
```

### 4. Стили пагинации на мобильных

Пагинация оптимизирована для мобильных устройств:

```css
@media screen and (max-width: 768px) {
  #tours-pagination {
    margin-top: 40px !important;
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 8px !important;
  }
  
  #tours-pagination .pagination-page-btn {
    min-width: 44px !important; /* Увеличенный размер для удобства */
    height: 44px !important;
    font-size: 16px !important;
  }
}
```

## Поведение

1. **На мобильных устройствах (≤768px):**
   - Карточки отображаются вертикально (одна под другой)
   - Показывается **6 карточек на странице** (все друг под другом)
   - Пагинация отображается внизу, если туров больше 6
   - Кнопки пагинации увеличены для удобства нажатия (44x44px)
   - Убрана фиксированная высота контейнера (height: auto)
   - Переопределен `display: contents` на `display: flex` для правильного отображения
   - Планшетные стили (2 колонки) не применяются на мобильных

2. **На десктопе (>768px):**
   - Карточки отображаются в сетке (3 колонки)
   - Показывается 6 карточек на странице
   - Пагинация отображается внизу, если туров больше 6

## Файлы

- `public/theme.css` - основные стили для мобильных устройств
- `public/mobile-ux.css` - дополнительные стили для мобильного UX
- `public/api-integration.js` - логика пагинации и отображения карточек

