@echo off
echo ========================================
echo   Calendar Backend - Spring Boot
echo ========================================
echo.
echo Starting Spring Boot application...
echo Server will be available at: http://localhost:8080
echo Health check: http://localhost:8080/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

mvnw.cmd spring-boot:run
