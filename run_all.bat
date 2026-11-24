@echo off
title RESUMIND-AI Starter
echo ==============================================
echo Starting RESUMIND-AI (Backend + Frontend)
echo ==============================================
start "RESUMIND Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "RESUMIND Frontend" cmd /k "%~dp0run_frontend.bat"
echo Both servers are launching in separate windows!
