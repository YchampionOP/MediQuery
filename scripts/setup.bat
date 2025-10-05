@echo off
REM MediQuery AI Setup and Test Script for Windows

echo 🏥 MediQuery AI - Setup and Test Script
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python is not installed. Please install Python 3.8+ first.
        exit /b 1
    )
)

echo ✅ Prerequisites check passed

echo.
echo 📦 Installing dependencies...

REM Backend dependencies
echo Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        exit /b 1
    )
)
cd ..

REM Frontend dependencies
echo Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        exit /b 1
    )
)
cd ..

REM Python dependencies
echo Installing Python dependencies...
cd data-pipeline
if not exist "venv" (
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Python dependencies
        exit /b 1
    )
    deactivate
)
cd ..

echo ✅ Dependencies installed successfully

REM Create logs directory
if not exist "logs" mkdir logs

REM Setup environment file
if not exist ".env" (
    echo.
    echo ⚙️ Setting up environment configuration...
    copy .env.example .env
    echo ✅ Environment file created. Please edit .env with your Elasticsearch credentials.
)

REM Compile TypeScript
echo.
echo 🔨 Compiling TypeScript...
cd backend
npm run build
if %errorlevel% neq 0 (
    echo ❌ TypeScript compilation failed
    exit /b 1
)
cd ..

REM Build frontend
echo Building frontend...
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)
cd ..

echo ✅ Build completed successfully

REM Test backend startup
echo.
echo 🧪 Testing backend startup...
cd backend
start /b npm start
timeout /t 5 >nul

REM Check if backend is running
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running successfully
) else (
    echo ⚠️ Backend health check failed ^(this is expected if Elasticsearch is not configured^)
)

REM Kill the background process
taskkill /f /im node.exe >nul 2>&1
cd ..

echo.
echo 🎉 Setup completed!
echo.
echo Next steps:
echo 1. Configure your .env file with Elasticsearch credentials
echo 2. Start the development servers:
echo    - Backend: cd backend ^&^& npm run dev
echo    - Frontend: cd frontend ^&^& npm run dev
echo 3. Visit http://localhost:3000 to use the application
echo.
echo For data processing:
echo 4. Run the data pipeline: cd data-pipeline ^&^& python process_data.py --create-indices
echo.
echo 📚 Documentation: See README.md for detailed instructions

pause