#!/bin/bash

echo "🚀 Starting RAG PDF System for Agiens Chat"
echo "=========================================="

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "Please create backend/.env file with required environment variables"
    exit 1
fi

# Check for OpenAI API key
if ! grep -q "OPENAI_API_KEY=" backend/.env || grep -q "OPENAI_API_KEY=your-openai-api-key-here" backend/.env; then
    echo "❌ OpenAI API key not configured!"
    echo ""
    echo "Please edit backend/.env and add your OpenAI API key:"
    echo "OPENAI_API_KEY=sk-your-actual-api-key-here"
    echo ""
    echo "You can get an API key from: https://platform.openai.com/api-keys"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install Python dependencies for RAG service
echo "📦 Installing Python dependencies..."
if command -v python3 &> /dev/null; then
    python3 -m pip install -r backend/requirements.txt
elif command -v python &> /dev/null; then
    python -m pip install -r backend/requirements.txt
else
    echo "❌ Python not found! Please install Python 3.8 or higher"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    echo "You may need to install them manually:"
    echo "pip install -r backend/requirements.txt"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads/temp
mkdir -p backend/chroma_db

echo "✅ Setup complete!"
echo ""
echo "🎯 Now you need to start three services:"
echo ""
echo "1. Backend Server (Terminal 1):"
echo "   cd backend && npm start"
echo ""
echo "2. Python RAG Service (Terminal 2):"
echo "   python3 backend/services/ragService.py"
echo ""
echo "3. Frontend Dev Server (Terminal 3):"
echo "   npm run dev"
echo ""
echo "📋 Services will run on:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3001"
echo "   - RAG Service: http://localhost:8001"
echo ""
echo "💡 After all services are running:"
echo "   1. Upload PDF files using the PDF button in the top-right"
echo "   2. Ask questions about your documents in the chat"
echo "   3. The AI will automatically find relevant context from your PDFs"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Make sure all three services are running"
echo "   - Check that ports 3001, 5173, and 8001 are available"
echo "   - Verify your OpenAI API key is valid and has credits" 