#!/bin/bash

# UrjaBandhu Development Setup Script
echo "🚀 Setting up UrjaBandhu Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ from https://python.org/"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work. Install from https://docker.com/"
fi

echo "✅ Prerequisites check completed!"

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependencies installation failed"
    exit 1
fi

echo "✅ Frontend setup completed!"

# Setup Backend
echo "🐍 Setting up Backend..."
cd ../backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi

echo "✅ Backend setup completed!"

# Setup Environment Variables
echo "🔧 Setting up environment variables..."
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOL
# Database Configuration
DATABASE_URL=postgresql://postgres:password123@localhost:5432/urjabandhu
REDIS_URL=redis://localhost:6379

# InfluxDB Configuration
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=urjabandhu-token-2024
INFLUXDB_ORG=urjabandhu
INFLUXDB_BUCKET=electricity_data

# API Configuration
API_SECRET_KEY=your-secret-key-change-in-production
API_ALGORITHM=HS256
API_ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services (Optional - for production features)
OPENAI_API_KEY=your-openai-api-key
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-region
GOOGLE_VISION_API_KEY=your-google-vision-key

# Development Settings
DEBUG=true
LOG_LEVEL=INFO
EOL
    echo "✅ Created .env file with default values"
else
    echo "✅ .env file already exists"
fi

# Setup Docker (optional)
if command -v docker &> /dev/null; then
    echo "🐳 Setting up Docker environment..."
    
    # Check if docker-compose is available
    if command -v docker-compose &> /dev/null; then
        echo "Starting Docker services..."
        docker-compose up -d postgres redis influxdb
        echo "✅ Docker services started!"
    else
        echo "⚠️  docker-compose not found. Please install docker-compose for full functionality"
    fi
fi

# Create sample data directories
mkdir -p data/samples
mkdir -p logs
mkdir -p uploads

echo "📁 Created necessary directories"

# Display next steps
echo ""
echo "🎉 UrjaBandhu setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the backend server:"
echo "   cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "2. Start the frontend development server:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser and navigate to:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "4. (Optional) Start all services with Docker:"
echo "   docker-compose up -d"
echo ""
echo "📖 For more information, check the README.md and docs/ folder"
echo "🐛 If you encounter issues, please check the troubleshooting section in docs/"
