// Интеграция с мессенджерами (WhatsApp, Telegram)

// Конфигурация (можно вынести в настройки админ-панели)
const MESSENGER_CONFIG = {
  whatsapp: {
    phone: '+79999999999', // Замените на реальный номер
    enabled: true
  },
  telegram: {
    username: 'neverend_travel', // Замените на реальный username
    enabled: true
  }
};

// Инициализация кнопок мессенджеров
function initMessengerButtons() {
  // Создаем контейнер для кнопок мессенджеров
  const messengerContainer = document.createElement('div');
  messengerContainer.className = 'messenger-buttons';
  messengerContainer.id = 'messenger-buttons';
  
  // Добавляем стили
  if (!document.getElementById('messenger-buttons-styles')) {
    const style = document.createElement('style');
    style.id = 'messenger-buttons-styles';
    style.textContent = `
      .messenger-buttons {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .messenger-button {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        text-decoration: none;
        position: relative;
      }
      
      .messenger-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      }
      
      .messenger-button:active {
        transform: scale(0.95);
      }
      
      .messenger-button-whatsapp {
        background-color: #25D366;
        color: white;
      }
      
      .messenger-button-telegram {
        background-color: #0088cc;
        color: white;
      }
      
      .messenger-button svg {
        width: 28px;
        height: 28px;
      }
      
      @media (max-width: 768px) {
        .messenger-buttons {
          bottom: 80px;
          right: 16px;
        }
        
        .messenger-button {
          width: 52px;
          height: 52px;
        }
        
        .messenger-button svg {
          width: 24px;
          height: 24px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Кнопка WhatsApp
  if (MESSENGER_CONFIG.whatsapp.enabled) {
    const whatsappBtn = document.createElement('a');
    whatsappBtn.className = 'messenger-button messenger-button-whatsapp';
    whatsappBtn.href = `https://wa.me/${MESSENGER_CONFIG.whatsapp.phone.replace(/[^0-9]/g, '')}`;
    whatsappBtn.target = '_blank';
    whatsappBtn.rel = 'noopener noreferrer';
    whatsappBtn.title = 'Написать в WhatsApp';
    whatsappBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;
    messengerContainer.appendChild(whatsappBtn);
  }
  
  // Кнопка Telegram
  if (MESSENGER_CONFIG.telegram.enabled) {
    const telegramBtn = document.createElement('a');
    telegramBtn.className = 'messenger-button messenger-button-telegram';
    telegramBtn.href = `https://t.me/${MESSENGER_CONFIG.telegram.username.replace('@', '')}`;
    telegramBtn.target = '_blank';
    telegramBtn.rel = 'noopener noreferrer';
    telegramBtn.title = 'Написать в Telegram';
    telegramBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15.056-.22.06-.148.16-.182.27-.11.106.066.7 1.317 2.002 3.87.27.5.48.66.656.66.136 0 .27-.068.39-.207.13-.15.26-.33.39-.54.24-.33.42-.59.59-.79.19-.22.33-.37.33-.61 0-.22-.15-.37-.33-.22-.74.48-2.14 1.18-3.01 1.5-.33.12-.65.18-.95.18-.32-.01-.55-.08-.75-.26-.22-.2-.4-.5-.55-.9-.48-1.5-.99-4.22-1.38-5.96-.14-.72-.27-1.23-.38-1.58-.06-.18-.1-.3-.12-.47-.01-.08-.01-.22.15-.33.18-.15.4-.2.66-.12.38.12 1.25.52 2.77 1.25z"/>
      </svg>
    `;
    messengerContainer.appendChild(telegramBtn);
  }
  
  // Добавляем контейнер на страницу
  if (messengerContainer.children.length > 0) {
    document.body.appendChild(messengerContainer);
  }
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMessengerButtons);
} else {
  initMessengerButtons();
}

// Функция для отправки сообщения в мессенджер с информацией о туре
function sendTourToMessenger(messenger, tour) {
  const message = encodeURIComponent(
    `Привет! Меня интересует тур "${tour.title}"\n` +
    `Даты: ${tour.date_start ? new Date(tour.date_start).toLocaleDateString('ru-RU') : 'Уточнить'}\n` +
    `Цена: ${tour.price ? tour.price.toLocaleString('ru-RU') + ' ₽' : 'Уточнить'}\n` +
    `Локация: ${tour.location || 'Уточнить'}`
  );
  
  let url = '';
  if (messenger === 'whatsapp') {
    url = `https://wa.me/${MESSENGER_CONFIG.whatsapp.phone.replace(/[^0-9]/g, '')}?text=${message}`;
  } else if (messenger === 'telegram') {
    url = `https://t.me/${MESSENGER_CONFIG.telegram.username.replace('@', '')}?start=${encodeURIComponent(tour.id)}`;
  }
  
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Экспортируем функции для использования в других скриптах
window.initMessengerButtons = initMessengerButtons;
window.sendTourToMessenger = sendTourToMessenger;

