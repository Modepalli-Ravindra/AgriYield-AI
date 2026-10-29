@echo off
title Terraflect Backend (FastAPI)
echo ========================================================
echo  Starting Terraflect Backend on http://127.0.0.1:8000
echo  API Documentation: http://127.0.0.1:8000/docs
echo ========================================================
cd /d "%~dp0"
if exist "..\venv\Scripts\activate.bat" (
    call "..\venv\Scripts\activate.bat"
) else if exist "venv\Scripts\activate.bat" (
    call "venv\Scripts\activate.bat"
)
if not exist ".env" (
    if exist "..\.env" (
        copy "..\.env" ".env" >nul
    ) else if exist ".env.example" (
        copy ".env.example" ".env" >nul
    )
)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir app
pause

