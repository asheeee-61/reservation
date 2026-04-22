@echo off
color 0a
echo ===================================================
echo   Starting Reservation System Services...
echo ===================================================
echo.

echo [1/3] Starting Admin (React/Vite) in a new window...
start "Admin" cmd /k "cd admin && npm run dev"

echo [2/3] Starting Backend (Laravel) in a new window...
start "Backend" cmd /k "cd backend-repo && composer dev"

echo [3/3] Starting Notice System (Node) in a new window...
start "Notice System" cmd /k "cd notice-system && npm start"

echo.
echo All services have been launched in separate windows!
echo Close those windows to stop the services.
echo.
pause
