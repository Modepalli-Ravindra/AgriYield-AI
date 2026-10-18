@echo off
title Terraflect Launcher
echo ========================================================
echo  Launching Terraflect Platform (Backend + Frontend)
echo ========================================================
start "Terraflect Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 2 /nobreak >nul
start "Terraflect Frontend" cmd /k "%~dp0run_frontend.bat"
echo.
echo Both servers started in separate terminal windows!
echo  - Backend API: http://127.0.0.1:8000
echo  - Interactive Swagger Docs: http://127.0.0.1:8000/docs
echo  - Frontend Web UI: http://127.0.0.1:5173
echo.
pause
