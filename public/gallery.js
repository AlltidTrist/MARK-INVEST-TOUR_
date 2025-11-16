// Галерея изображений для туров с lightbox

(function() {
  'use strict';
  
  function initTourGallery(tourId) {
    try {
      if (!tourId) {
        return;
      }
      
      const galleryContainer = document.getElementById('tour-gallery');
      if (!galleryContainer) {
        return;
      }
      
      // Загружаем изображения
      fetch(`/api/tours/${tourId}/images`)
        .then(res => {
          if (!res.ok) return [];
          return res.json();
        })
        .then(images => {
          if (!images || images.length === 0) return;
          
          // Создаем галерею
          const galleryHTML = `
            <div class="tour-gallery-grid">
              ${images.map((img, index) => `
                <div class="tour-gallery-item" data-index="${index}">
                  <img src="${img.image_url}" alt="Фото тура ${index + 1}" loading="lazy">
                  <div class="tour-gallery-overlay">
                    <button class="tour-gallery-view" onclick="openLightbox(${index})">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
            <div id="lightbox" class="lightbox" onclick="closeLightbox()">
              <button class="lightbox-close" onclick="closeLightbox()">×</button>
              <button class="lightbox-prev" onclick="changeLightboxImage(-1)">‹</button>
              <button class="lightbox-next" onclick="changeLightboxImage(1)">›</button>
              <img id="lightbox-image" src="" alt="">
              <div class="lightbox-counter">
                <span id="lightbox-current">1</span> / <span id="lightbox-total">${images.length}</span>
              </div>
            </div>
          `;
          
          galleryContainer.innerHTML = galleryHTML;
          
          // Сохраняем изображения для lightbox
          window.galleryImages = images;
          window.currentLightboxIndex = 0;
        })
        .catch(err => {
          // Тихая ошибка
          if (console && console.error) {
            console.error('Ошибка загрузки галереи:', err);
          }
        });
    } catch (err) {
      // Тихая ошибка
      if (console && console.error) {
        console.error('Ошибка initTourGallery:', err);
      }
    }
  }

  function openLightbox(index) {
    try {
      const lightbox = document.getElementById('lightbox');
      const lightboxImage = document.getElementById('lightbox-image');
      const lightboxCurrent = document.getElementById('lightbox-current');
      
      if (!lightbox || !window.galleryImages) return;
      
      window.currentLightboxIndex = index;
      if (lightboxImage) lightboxImage.src = window.galleryImages[index].image_url;
      if (lightboxCurrent) lightboxCurrent.textContent = index + 1;
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    } catch (err) {
      if (console && console.error) {
        console.error('Ошибка openLightbox:', err);
      }
    }
  }

  function closeLightbox() {
    try {
      const lightbox = document.getElementById('lightbox');
      if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }
    } catch (err) {
      if (console && console.error) {
        console.error('Ошибка closeLightbox:', err);
      }
    }
  }

  function changeLightboxImage(direction) {
    try {
      if (!window.galleryImages) return;
      
      window.currentLightboxIndex += direction;
      
      if (window.currentLightboxIndex < 0) {
        window.currentLightboxIndex = window.galleryImages.length - 1;
      } else if (window.currentLightboxIndex >= window.galleryImages.length) {
        window.currentLightboxIndex = 0;
      }
      
      openLightbox(window.currentLightboxIndex);
    } catch (err) {
      if (console && console.error) {
        console.error('Ошибка changeLightboxImage:', err);
      }
    }
  }

  // Закрытие по Escape
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      try {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight') {
          changeLightboxImage(1);
        }
      } catch (err) {
        // Тихая ошибка
      }
    });
  }

  // Экспортируем функции
  if (typeof window !== 'undefined') {
    window.initTourGallery = initTourGallery;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.changeLightboxImage = changeLightboxImage;
  }
})();

