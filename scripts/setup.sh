#!/bin/bash

# MediQuery AI Setup and Test Script

echo "🏥 MediQuery AI - Setup and Test Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
fi
cd ..

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi
cd ..

# Python dependencies
echo "Installing Python dependencies..."
cd data-pipeline
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
    deactivate
fi
cd ..

echo "✅ Dependencies installed successfully"

# Create logs directory
mkdir -p logs

# Setup environment file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️ Setting up environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created. Please edit .env with your Elasticsearch credentials."
fi

# Compile TypeScript
echo ""
echo "🔨 Compiling TypeScript..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ Build completed successfully"

# Test backend startup
echo ""
echo "🧪 Testing backend startup..."
cd backend
timeout 10 npm start &
BACKEND_PID=$!
sleep 5

# Check if backend is running
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is running successfully"
    kill $BACKEND_PID 2>/dev/null
else
    echo "⚠️ Backend health check failed (this is expected if Elasticsearch is not configured)"
    kill $BACKEND_PID 2>/dev/null
fi
cd ..

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with Elasticsearch credentials"
echo "2. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo "3. Visit http://localhost:3000 to use the application"
echo ""
echo "For data processing:"
echo "4. Run the data pipeline: cd data-pipeline && python process_data.py --create-indices"
echo ""
echo "📚 Documentation: See README.md for detailed instructions"