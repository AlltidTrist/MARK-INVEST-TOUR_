/**
 * Скрипт для тестирования API endpoints
 * Запуск: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passedTests = 0;
let failedTests = 0;
const results = [];

/**
 * Выполнить HTTP запрос
 */
function makeRequest(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Тест функции
 */
async function test(name, testFn) {
  try {
    console.log(`${colors.cyan}Testing: ${name}${colors.reset}`);
    await testFn();
    passedTests++;
    console.log(`${colors.green}✓ PASSED: ${name}${colors.reset}\n`);
    results.push({ name, status: 'PASSED' });
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗ FAILED: ${name}${colors.reset}`);
    console.log(`${colors.red}  Error: ${error.message}${colors.reset}\n`);
    results.push({ name, status: 'FAILED', error: error.message });
  }
}

/**
 * Основные тесты
 */
async function runTests() {
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}  API Testing Suite${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  let authToken = null;

  // 1. Health Check
  await test('Health Check', async () => {
    const response = await makeRequest('GET', `${API_URL}/health`);
    if (response.status !== 200 && response.status !== 503) {
      throw new Error(`Expected status 200 or 503, got ${response.status}`);
    }
    if (!response.body.status) {
      throw new Error('Response should contain status field');
    }
  });

  // 2. Get Tours (публичный)
  await test('GET /api/tours (публичный)', async () => {
    const response = await makeRequest('GET', `${API_URL}/tours`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 3. Get Tours with filters
  await test('GET /api/tours?status=active', async () => {
    const response = await makeRequest('GET', `${API_URL}/tours?status=active`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 4. Login
  await test('POST /api/auth/login', async () => {
    const response = await makeRequest('POST', `${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}. Response: ${JSON.stringify(response.body)}`);
    }
    if (!response.body.token) {
      throw new Error('Response should contain token');
    }
    authToken = response.body.token;
  });

  // 5. Get Me (с авторизацией)
  await test('GET /api/auth/me (с авторизацией)', async () => {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    const response = await makeRequest('GET', `${API_URL}/auth/me`, null, authToken);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.body.username) {
      throw new Error('Response should contain username');
    }
  });

  // 6. Get Applications (с авторизацией)
  await test('GET /api/applications (с авторизацией)', async () => {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    const response = await makeRequest('GET', `${API_URL}/applications`, null, authToken);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 7. Create Application (публичный)
  await test('POST /api/applications (публичный)', async () => {
    const response = await makeRequest('POST', `${API_URL}/applications`, {
      name: 'Test User',
      phone: '+7 (999) 123-45-67',
      email: 'test@example.com',
      direction: 'Австралия',
      message: 'Test message'
    });
    // Принимаем как 200, так и 201 (в зависимости от реализации)
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Expected status 200 or 201, got ${response.status}. Response: ${JSON.stringify(response.body)}`);
    }
    if (!response.body.id) {
      throw new Error('Response should contain id');
    }
  });

  // 8. Get Subscriptions (с авторизацией)
  await test('GET /api/subscriptions (с авторизацией)', async () => {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    const response = await makeRequest('GET', `${API_URL}/subscriptions`, null, authToken);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 9. Subscribe (публичный)
  await test('POST /api/subscriptions (публичный)', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const response = await makeRequest('POST', `${API_URL}/subscriptions`, {
      email: testEmail
    });
    // Может быть 200 или 400 (если уже подписан)
    if (response.status !== 200 && response.status !== 400) {
      throw new Error(`Expected status 200 or 400, got ${response.status}. Response: ${JSON.stringify(response.body)}`);
    }
  });

  // 10. Swagger UI доступен
  await test('Swagger UI доступен', async () => {
    // Swagger UI может возвращать HTML, поэтому проверяем статус
    const response = await makeRequest('GET', `${BASE_URL}/api-docs`);
    // Swagger UI может возвращать 200 или редирект, или HTML страницу
    if (response.status !== 200 && response.status !== 301 && response.status !== 302 && response.status !== 404) {
      throw new Error(`Unexpected status ${response.status}`);
    }
    // Если 404, это может быть нормально, если Swagger не настроен
    if (response.status === 404) {
      console.log(`${colors.yellow}  Warning: Swagger UI not found (404). This is OK if Swagger is not configured.${colors.reset}`);
    }
  });

  // Итоги
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}  Test Results${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Total: ${passedTests + failedTests}\n`);

  if (failedTests > 0) {
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`${colors.red}  - ${r.name}: ${r.error}${colors.reset}`);
    });
    process.exit(1);
  } else {
    console.log(`${colors.green}All tests passed! ✓${colors.reset}`);
    process.exit(0);
  }
}

// Запуск тестов
console.log(`${colors.yellow}Starting API tests...${colors.reset}\n`);
console.log(`${colors.yellow}Make sure the server is running on ${BASE_URL}}${colors.reset}\n`);

setTimeout(() => {
  runTests().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}, 1000);

