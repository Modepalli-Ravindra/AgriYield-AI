@echo off
title Terraflect Backend (FastAPI)
echo ========================================================
echo  Starting Terraflect Backend on http://127.0.0.1:8000
echo  API Documentation: http://127.0.0.1:8000/docs
echo ========================================================
cd /d "%~dp0"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
