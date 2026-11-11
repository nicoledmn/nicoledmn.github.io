@echo off
title Chatbot Academico - Nicole Nicolini (LM Studio + Voz)
color 0B
cls
echo ========================================================
echo   Assistente Academico - Nicole De Mori Nicolini
echo   (Chatbot com Avatar, Comando de Voz e LM Studio)
echo ========================================================
echo.
echo [1/2] Abrindo seu site conectado ao LM Studio no navegador...
start http://localhost:8000/
echo.
echo [2/2] Iniciando conexao com o LM Studio (porta 1234)...
echo.
cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel% equ 0 (
    python -u chatbot_app.py
    goto end
)

where py >nul 2>&1
if %errorlevel% equ 0 (
    py -u chatbot_app.py
    goto end
)

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" -u chatbot_app.py
    goto end
)

echo [ERRO] Python nao encontrado no sistema.
echo Por favor, instale o Python ou verifique a instalacao.

:end
pause
