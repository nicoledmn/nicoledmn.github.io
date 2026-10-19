@echo off
title Chatbot Academico - Nicole Nicolini (LM Studio)
color 0B
cls
echo ========================================================
echo   Assistente Academico - Nicole De Mori Nicolini
echo ========================================================
echo.
echo [1/2] Abrindo seu site com o chatbot no navegador...
start https://nicoledmn.github.io/
echo.
echo [2/2] Iniciando conexao com o LM Studio (porta 1234)...
echo.
cd /d "%~dp0"
py -u chatbot_app.py
pause
