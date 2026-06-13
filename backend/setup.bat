@echo off
setlocal

echo Starting MPBSE Laravel backend setup...

where php >nul 2>&1 || (
  echo PHP not found. Install XAMPP and add PHP to PATH.
  exit /b 1
)

where composer >nul 2>&1 || (
  echo Composer not found.
  exit /b 1
)

cd /d "%~dp0"

if not exist vendor (
  echo Installing Composer dependencies in XAMPP folder...
  if not exist C:\xampp\htdocs\mpbse-backend (
    robocopy "%cd%" C:\xampp\htdocs\mpbse-backend /E /XD vendor node_modules .git >nul
  )
  cd /d C:\xampp\htdocs\mpbse-backend
  composer install --no-interaction --prefer-dist
  cd /d "%~dp0"
  if not exist vendor (
    mklink /J "%cd%\vendor" "C:\xampp\htdocs\mpbse-backend\vendor"
  )
)

if not exist .env (
  copy .env.example .env >nul
  php artisan key:generate --force
)

echo.
echo Make sure XAMPP MySQL is running, then run:
echo   php artisan migrate --force
echo   php artisan db:seed --force
echo   php artisan serve
echo.
echo Admin: http://127.0.0.1:8000/admin/login
echo Email: admin@mpbse.org
echo Password: Admin@123

endlocal
