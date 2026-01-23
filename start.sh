#!/bin/bash
# Digi-tionary Quick Start Script for macOS/Linux

echo ""
echo "========================================"
echo "    Digi-tionary - Quick Start"
echo "========================================"
echo ""

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Start backend in background
echo "Starting backend server on port 8000..."
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo ""
echo "Starting frontend dev server..."
echo "Frontend will open at http://localhost:5173"
echo ""
cd frontend
npm install > /dev/null 2>&1
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
