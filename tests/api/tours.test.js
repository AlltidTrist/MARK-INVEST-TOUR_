/**
 * Тесты для API туров
 */

const request = require('supertest');
const { initDatabase } = require('../../server/config/database');
const app = require('../app');

// Инициализируем БД перед всеми тестами
beforeAll(async () => {
  await initDatabase();
}, 10000);

afterAll(async () => {
  // Закрываем соединение с БД
  const { getDatabase } = require('../../server/config/database');
  const db = getDatabase();
  if (db) {
    db.close();
  }
});

describe('GET /api/tours', () => {
  it('should return array of tours', async () => {
    const res = await request(app)
      .get('/api/tours?status=active')
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should filter tours by status', async () => {
    const res = await request(app)
      .get('/api/tours?status=active')
      .expect(200);
    
    if (res.body.length > 0) {
      res.body.forEach(tour => {
        expect(tour.status).toBe('active');
      });
    }
  });
});

describe('GET /api/tours/:id', () => {
  it('should return 404 for non-existent tour', async () => {
    const res = await request(app)
      .get('/api/tours/999999')
      .expect(404);
    
    expect(res.body).toHaveProperty('error');
  });

  it('should return tour if exists', async () => {
    // Сначала получаем список туров
    const toursRes = await request(app)
      .get('/api/tours')
      .expect(200);
    
    if (toursRes.body.length > 0) {
      const tourId = toursRes.body[0].id;
      const res = await request(app)
        .get(`/api/tours/${tourId}`)
        .expect(200);
      
      expect(res.body).toHaveProperty('id', tourId);
      expect(res.body).toHaveProperty('title');
    }
  });
});

describe('POST /api/tours (requires auth)', () => {
  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/tours')
      .send({
        title: 'Test Tour',
        price: 1000
      })
      .expect(401);
    
    expect(res.body).toHaveProperty('error');
  });
});

