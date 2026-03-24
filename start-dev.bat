@echo off
echo =======================================
echo Starting Restaurant Reservation System
echo =======================================

echo.
echo [1/3] Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd backend && php artisan serve"

echo.
echo [2/3] Starting Public Frontend...
start "Public Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Starting Admin Dashboard...
start "Admin Dashboard" cmd /k "cd admin && npm run dev"

echo.
echo All development servers are spinning up in separate windows!
echo - Public Frontend: http://localhost:5173
echo - Admin Dashboard: http://localhost:5174
echo - Backend API: http://localhost:8000
echo.
pause
