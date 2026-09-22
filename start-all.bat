@echo off
title Launch ReTrace AI
echo ============================================================
echo Launching ReTrace Full-Stack Application...
echo Backend API:  http://127.0.0.1:8000
echo Frontend UI:  http://localhost:3000
echo ============================================================

start "ReTrace Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "ReTrace Frontend" cmd /k "%~dp0start-frontend.bat"

echo Both servers launched! Opening browser...
start http://localhost:3000
