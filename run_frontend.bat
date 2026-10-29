@echo off
title Terraflect Frontend (Vite)
echo ========================================================
echo  Starting Terraflect Frontend on http://127.0.0.1:5173
echo ========================================================
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Running npm install...
    call npm install
)
npm run dev
pause

