@echo off
title Karaoke Manager Launcher
color 0A

echo ============================================
echo        KARAOKE MANAGER - Avvio
echo ============================================
echo.

REM Ottieni la directory corrente dello script
set "SCRIPT_DIR=%~dp0"

echo Directory: %SCRIPT_DIR%
echo.

echo [1/3] Avvio Backend Server...
start "Karaoke Manager - Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm start"

echo [2/3] Attendo avvio backend...
timeout /t 3 /nobreak >nul

echo [3/3] Avvio Frontend...
start "Karaoke Manager - Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ============================================
echo    Karaoke Manager avviato con successo!
echo ============================================
echo.
echo Il browser si aprira automaticamente tra 8 secondi...
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:3001
echo.

timeout /t 8 /nobreak >nul

echo Apertura browser...
start "" "http://localhost:3002"

echo.
echo Premi un tasto per chiudere questa finestra...
pause >nul
