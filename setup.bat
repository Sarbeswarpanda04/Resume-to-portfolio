@echo off
REM Resume to Portfolio - Setup Script for Windows
REM This script automates the initial setup process

echo ========================================
echo Resume to Portfolio Generator - Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)
echo [OK] Node.js found
node --version

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed. Please install Python 3.10+ first.
    pause
    exit /b 1
)
echo [OK] Python found
python --version

REM Check if MongoDB is installed (optional)
where mongod >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB found
) else (
    echo [WARNING] MongoDB not found. You can use MongoDB Atlas instead.
)

echo.
echo Installing dependencies...
echo.

REM Frontend setup
echo [1/2] Setting up Frontend...
cd frontend
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Frontend installation failed
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)

REM Create .env if it doesn't exist
if not exist ".env" (
    copy .env.example .env
    echo [INFO] Created frontend\.env from template
    echo [WARNING] Please update frontend\.env with your Firebase credentials
)

cd ..

REM Backend setup
echo.
echo [2/2] Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend installation failed
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Download spaCy model
echo Downloading spaCy language model...
python -m spacy download en_core_web_sm
if %ERRORLEVEL% EQU 0 (
    echo [OK] spaCy model downloaded
) else (
    echo [WARNING] spaCy model download failed - you may need to install it manually
)

REM Create .env if it doesn't exist
if not exist ".env" (
    copy .env.example .env
    echo [INFO] Created backend\.env from template
    echo [WARNING] Please update backend\.env with your configuration
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Update frontend\.env with your Firebase credentials
echo 2. Update backend\.env with your database and secret key
echo 3. Place firebase-credentials.json in the backend folder
echo 4. Start MongoDB (if using local instance)
echo 5. Run: cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo 6. In another terminal: cd frontend ^&^& npm run dev
echo.
echo Documentation:
echo - Quick Start: QUICKSTART.md
echo - Setup Guide: SETUP.md
echo - API Docs: API_DOCUMENTATION.md
echo.
echo Happy coding!
echo.
pause
