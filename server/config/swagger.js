/**
 * Конфигурация Swagger/OpenAPI
 * @module config/swagger
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Neverend Travel API',
      version: '1.0.0',
      description: 'RESTful API для управления турами и заявками',
      contact: {
        name: 'API Support',
        email: 'support@neverend-travel.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.neverend-travel.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен, полученный при авторизации'
        }
      },
      schemas: {
        Tour: {
          type: 'object',
          required: ['title', 'price', 'status'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор тура',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Название тура',
              example: 'Тур в Австралию'
            },
            description: {
              type: 'string',
              description: 'Полное описание тура',
              example: 'Увлекательное путешествие по Австралии...'
            },
            short_description: {
              type: 'string',
              description: 'Краткое описание тура',
              example: 'Откройте для себя красоты Австралии'
            },
            image_url: {
              type: 'string',
              description: 'URL изображения тура',
              example: '/assets/images/1234567890.webp'
            },
            price: {
              type: 'number',
              description: 'Цена тура в рублях',
              example: 150000
            },
            duration: {
              type: 'integer',
              description: 'Длительность тура в днях',
              example: 14
            },
            location: {
              type: 'string',
              description: 'Местоположение тура',
              example: 'Австралия'
            },
            date_start: {
              type: 'string',
              format: 'date',
              description: 'Дата начала тура',
              example: '2024-06-01'
            },
            date_end: {
              type: 'string',
              format: 'date',
              description: 'Дата окончания тура',
              example: '2024-06-14'
            },
            max_participants: {
              type: 'integer',
              description: 'Максимальное количество участников',
              example: 20
            },
            current_participants: {
              type: 'integer',
              description: 'Текущее количество участников',
              example: 5
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'completed', 'cancelled'],
              description: 'Статус тура',
              example: 'active'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания',
              example: '2024-01-15T10:30:00Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата обновления',
              example: '2024-01-20T15:45:00Z'
            }
          }
        },
        TourProgram: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор программы'
            },
            tour_id: {
              type: 'integer',
              description: 'ID тура'
            },
            day: {
              type: 'integer',
              description: 'День программы',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Название дня',
              example: 'Прибытие в Сидней'
            },
            description: {
              type: 'string',
              description: 'Описание дня',
              example: 'Встреча в аэропорту, трансфер в отель...'
            }
          }
        },
        Application: {
          type: 'object',
          required: ['name', 'phone', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор заявки',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Имя заявителя',
              example: 'Иван Иванов'
            },
            phone: {
              type: 'string',
              description: 'Телефон заявителя',
              example: '+7 (999) 123-45-67'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email заявителя',
              example: 'ivan@example.com'
            },
            direction: {
              type: 'string',
              description: 'Направление тура',
              example: 'Австралия'
            },
            message: {
              type: 'string',
              description: 'Сообщение от заявителя',
              example: 'Хочу узнать больше о туре'
            },
            tour_id: {
              type: 'integer',
              nullable: true,
              description: 'ID связанного тура (если есть)',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['new', 'processed', 'rejected'],
              description: 'Статус заявки',
              example: 'new'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания заявки',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор подписки'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email подписчика',
              example: 'subscriber@example.com'
            },
            is_active: {
              type: 'boolean',
              description: 'Активна ли подписка',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата подписки'
            }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'admin'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Пароль',
              example: 'admin123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT токен для авторизации',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  example: 1
                },
                username: {
                  type: 'string',
                  example: 'admin'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке',
              example: 'Тур не найден'
            }
          }
        },
        SuccessMessage: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Сообщение об успешной операции',
              example: 'Тур успешно создан'
            }
          }
        },
        TourImage: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор изображения'
            },
            tour_id: {
              type: 'integer',
              description: 'ID тура'
            },
            image_url: {
              type: 'string',
              description: 'URL изображения',
              example: '/assets/images/1234567890.webp'
            },
            image_order: {
              type: 'integer',
              description: 'Порядок отображения',
              example: 0
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Tours',
        description: 'Операции с турами'
      },
      {
        name: 'Auth',
        description: 'Авторизация и аутентификация'
      },
      {
        name: 'Applications',
        description: 'Управление заявками'
      },
      {
        name: 'Subscriptions',
        description: 'Управление подписками'
      },
      {
        name: 'Analytics',
        description: 'Аналитика и статистика'
      },
      {
        name: 'Images',
        description: 'Управление изображениями туров'
      },
      {
        name: 'Health',
        description: 'Проверка работоспособности API'
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi
};

