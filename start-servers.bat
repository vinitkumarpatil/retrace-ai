@echo off
title ReTrace AI - Server Launcher
color 0B
echo ===================================================================
echo               ReTrace AI - Forensic Context Recovery Engine
echo                        Starting Local Servers
echo ===================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/2] Launching Backend Server (FastAPI on http://localhost:8000)...
start "ReTrace Backend (FastAPI)" cmd /k "title ReTrace Backend ^& color 0A ^& cd /d %ROOT_DIR%backend ^& venv\Scripts\python.exe run.py"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Launching Frontend Server (Next.js on http://localhost:3000)...
start "ReTrace Frontend (Next.js)" cmd /k "title ReTrace Frontend ^& color 0B ^& cd /d %ROOT_DIR%frontend ^& npm run dev"

echo.
echo ===================================================================
echo  Both servers are now launched in their own dedicated windows:
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend API:      http://localhost:8000
echo  - API Docs:         http://localhost:8000/docs
echo ===================================================================
echo.
