@echo off
cd /d "%~dp0"
echo Starting Laravel backend on http://127.0.0.1:8000
echo Admin login: http://127.0.0.1:8000/admin/login
php artisan serve --host=127.0.0.1 --port=8000
