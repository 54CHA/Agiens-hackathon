#!/bin/bash
echo "🚀 Starting RAG Service..."

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Please run ./start-rag-system.sh first"
    exit 1
fi

# Start the RAG service
echo "🤖 Starting Python RAG service on port 8001..."
python3 services/ragService.py
