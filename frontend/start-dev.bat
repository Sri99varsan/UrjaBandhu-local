@echo off
echo 🚀 Starting UrjaBandhu Frontend on port 3000...

echo 🔍 Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo ⚠️  Killing process %%a on port 3000...
    taskkill /PID %%a /F >nul 2>&1
)

echo ✅ Port 3000 is now available
echo 🚀 Starting Next.js development server...
echo 📱 Your app will be available at: http://localhost:3000

npm run dev -- --port 3000
