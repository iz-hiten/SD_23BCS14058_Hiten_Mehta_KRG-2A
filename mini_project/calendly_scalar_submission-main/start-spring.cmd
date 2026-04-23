@echo off
echo ========================================
echo   Starting Calendar App with Spring Boot
echo ========================================
echo.
echo [1/2] Starting Spring Boot backend on port 8081...
echo.

start "Spring Boot Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak > nul

echo.
echo [2/2] Starting React frontend on port 5173...
echo.

start "React Frontend" cmd /k "npm run dev:spring"

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo.
echo Backend:  http://localhost:8081/api/health
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause > nul

taskkill /FI "WINDOWTITLE eq Spring Boot Backend*" /F
taskkill /FI "WINDOWTITLE eq React Frontend*" /F
