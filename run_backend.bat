@echo off
title RESUMIND-AI Backend Server
echo ==============================================
echo Starting RESUMIND-AI Backend Server (FastAPI)
echo ==============================================
cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment 'venv' not found in backend folder!
    pause
    exit /b
)
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
