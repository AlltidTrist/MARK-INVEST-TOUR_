# Скрипт запуска админ-панели для PowerShell

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Запуск админ-панели NEVEREND" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js установлен: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js не установлен!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Пожалуйста, установите Node.js с сайта: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "После установки перезапустите этот скрипт." -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Проверка наличия npm
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm установлен: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm не найден!" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host ""

# Проверка наличия node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Установка зависимостей..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Не удалось установить зависимости!" -ForegroundColor Red
        Read-Host "Нажмите Enter для выхода"
        exit 1
    }
    Write-Host ""
}

# Проверка наличия .env
if (-not (Test-Path ".env")) {
    Write-Host "Создание файла .env..." -ForegroundColor Yellow
    @"
PORT=3000
JWT_SECRET=neverend-travel-secret-key-2024
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✓ Файл .env создан" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Запуск сервера..." -ForegroundColor Yellow
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Сервер будет доступен по адресу:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  Админ-панель:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "  Логин: admin" -ForegroundColor Yellow
Write-Host "  Пароль: admin123" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Для остановки сервера нажмите Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm start

