@echo off
title ReTrace - Frontend Dashboard (Next.js)
echo ============================================================
echo Starting ReTrace Frontend on http://localhost:3000
echo ============================================================
cd /d "%~dp0frontend"
npm run dev
pause
