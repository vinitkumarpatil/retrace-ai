@echo off
title ReTrace - Backend Server (FastAPI)
echo ============================================================
echo Starting ReTrace Backend on http://127.0.0.1:8000
echo Swagger UI docs available at: http://127.0.0.1:8000/docs
echo ============================================================
cd /d "%~dp0backend"
call .venv\Scripts\activate
python run.py
pause
