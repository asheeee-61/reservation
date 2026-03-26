@echo off
echo =======================================
1: echo Starting Unified Restaurant System
echo =======================================

echo.
echo [1/2] Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd backend && php artisan serve"

echo.
echo [2/2] Starting Unified SPA (Client + Admin)...
start "Unified SPA" cmd /k "cd admin && npm run dev"

echo.
echo All development servers are spinning up in separate windows!
echo - Landing Page: http://localhost:5173/
echo - Reservation: http://localhost:5173/reservacion
echo - Admin Dashboard: http://localhost:5173/admin
echo - Backend API: http://localhost:8000
echo.
echo NOTE: Make sure your MySQL database is running!
echo.
pause
