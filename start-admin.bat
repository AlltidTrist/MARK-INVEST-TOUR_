@echo off
echo ====================================
echo   Запуск админ-панели NEVEREND
echo ====================================
echo.

REM Проверка наличия Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo.
    echo Пожалуйста, установите Node.js с сайта: https://nodejs.org/
    echo После установки перезапустите этот файл.
    pause
    exit /b 1
)

REM Проверка наличия npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] npm не найден!
    echo.
    echo Пожалуйста, установите Node.js с сайта: https://nodejs.org/
    pause
    exit /b 1
)

REM Проверка наличия node_modules
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ОШИБКА] Не удалось установить зависимости!
        pause
        exit /b 1
    )
    echo.
)

REM Проверка наличия .env
if not exist ".env" (
    echo Создание файла .env...
    (
        echo PORT=3000
        echo JWT_SECRET=neverend-travel-secret-key-2024
    ) > .env
    echo Файл .env создан.
    echo.
)

echo Запуск сервера...
echo.
echo ====================================
echo   Сервер будет доступен по адресу:
echo   http://localhost:3000
echo.
echo   Админ-панель:
echo   http://localhost:3000/admin
echo.
echo   Логин: admin
echo   Пароль: admin123
echo ====================================
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.

call npm start

pause

