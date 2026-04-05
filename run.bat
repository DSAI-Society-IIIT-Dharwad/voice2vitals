@echo off
:: ============================================================
:: run.bat — Clinical AI Assistant launcher
:: Uses the dedicated Python 3.11 virtual environment
:: ============================================================

set SCRIPT_DIR=%~dp0
set VENV_PYTHON=%SCRIPT_DIR%venv\Scripts\python.exe

:: Check venv exists
if not exist "%VENV_PYTHON%" (
    echo [ERROR] Virtual environment not found at: %VENV_PYTHON%
    echo Run setup first.
    pause
    exit /b 1
)

:: Check argument
if "%~1"=="" (
    echo.
    echo  Usage:
    echo    run.bat path\to\conversation.mp3
    echo    run.bat path\to\consultation.mp4
    echo    run.bat path\to\file.mp3 --output-dir .\results
    echo.
    pause
    exit /b 1
)

echo.
echo  Clinical AI Assistant — Starting pipeline
echo  Input: %*
echo.

"%VENV_PYTHON%" "%SCRIPT_DIR%clinical_ai_assistant.py" %*

pause
