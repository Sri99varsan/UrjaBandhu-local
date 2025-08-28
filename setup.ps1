# UrjaBandhu Development Setup Script for Windows
Write-Host "🚀 Setting up UrjaBandhu Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.11+ from https://python.org/" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠️  Docker is not installed. Some features may not work. Install from https://docker.com/" -ForegroundColor Yellow
    $dockerAvailable = $false
}

Write-Host "✅ Prerequisites check completed!" -ForegroundColor Green

# Setup Frontend
Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan
Set-Location frontend

if (!(Test-Path "package.json")) {
    Write-Host "❌ package.json not found in frontend directory" -ForegroundColor Red
    exit 1
}

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend setup completed!" -ForegroundColor Green

# Setup Backend
Write-Host "🐍 Setting up Backend..." -ForegroundColor Cyan
Set-Location ../backend

# Create virtual environment
python -m venv venv
& .\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependencies installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend setup completed!" -ForegroundColor Green

# Setup Environment Variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Cyan
Set-Location ..

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    $envContent = @"
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
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file with default values" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Setup Docker (optional)
if ($dockerAvailable) {
    Write-Host "🐳 Setting up Docker environment..." -ForegroundColor Cyan
    
    try {
        docker-compose --version | Out-Null
        Write-Host "Starting Docker services..." -ForegroundColor Cyan
        docker-compose up -d postgres redis influxdb
        Write-Host "✅ Docker services started!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  docker-compose not found. Please install docker-compose for full functionality" -ForegroundColor Yellow
    }
}

# Create sample data directories
New-Item -ItemType Directory -Force -Path "data\samples" | Out-Null
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

Write-Host "📁 Created necessary directories" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "🎉 UrjaBandhu setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   uvicorn main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend development server (in new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open your browser and navigate to:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "   API Documentation: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "4. (Optional) Start all services with Docker:" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For more information, check the README.md and docs/ folder" -ForegroundColor Cyan
Write-Host "🐛 If you encounter issues, please check the troubleshooting section in docs/" -ForegroundColor Cyan
