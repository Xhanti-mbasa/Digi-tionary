@echo off
REM Digi-tionary Quick Start Script for Windows

echo.
echo ========================================
echo    Digi-tionary - Quick Start
echo ========================================
echo.

REM Check if venv exists, if not create it
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt -q

REM Start backend in background
echo Starting backend server on port 8000...
start "Backend" python main.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo.
echo Starting frontend dev server...
echo Frontend will open at http://localhost:5173
echo.
cd frontend
npm install > nul 2>&1
npm run dev

pause
