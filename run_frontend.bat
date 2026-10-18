@echo off
title Terraflect Frontend (Vite)
echo ========================================================
echo  Starting Terraflect Frontend on http://127.0.0.1:5173
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
