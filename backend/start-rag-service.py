#!/usr/bin/env python3
"""
Startup script for the RAG PDF service.
This script will install dependencies and start the RAG service.
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    else:
        print(f"✅ Python version: {sys.version.split()[0]}")

def install_requirements():
    """Install Python requirements."""
    print("📦 Installing Python dependencies...")
    requirements_file = Path("backend/requirements.txt")
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found in backend directory")
        sys.exit(1)
    
    try:
        # Install requirements
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def check_environment_variables():
    """Check for required environment variables."""
    required_vars = ["OPENAI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your environment or .env file")
        print("Example: export OPENAI_API_KEY='your-api-key-here'")
        sys.exit(1)
    else:
        print("✅ Required environment variables found")

def create_directories():
    """Create necessary directories."""
    directories = [
        "backend/uploads",
        "backend/chroma_db",
        "backend/uploads/temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Created necessary directories")

def start_service():
    """Start the RAG service."""
    print("🚀 Starting RAG PDF service...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Start the service
    try:
        subprocess.run([
            sys.executable, "services/ragService.py"
        ])
    except KeyboardInterrupt:
        print("\n👋 RAG service stopped")
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        sys.exit(1)

def main():
    """Main function."""
    print("🔧 RAG PDF Service Startup")
    print("=" * 40)
    
    # Check Python version
    check_python_version()
    
    # Check environment variables
    check_environment_variables()
    
    # Install requirements
    install_requirements()
    
    # Create directories
    create_directories()
    
    # Start service
    start_service()

if __name__ == "__main__":
    main() 