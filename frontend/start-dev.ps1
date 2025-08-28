#!/usr/bin/env pwsh

# Script to ensure port 3000 is available and start Next.js dev server
Write-Host "🚀 Starting UrjaBandhu Frontend on port 3000..." -ForegroundColor Green

# Function to kill processes on port 3000
function Stop-ProcessOnPort {
    param([int]$Port = 3000)
    
    Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Yellow
    
    # Get processes using port 3000
    $processes = netstat -ano | findstr ":$Port" | ForEach-Object {
        $line = $_.Trim() -split '\s+'
        if ($line.Length -ge 5) {
            $line[4]  # PID is the 5th column
        }
    }
    
    if ($processes) {
        Write-Host "⚠️  Found processes on port $Port. Terminating..." -ForegroundColor Red
        
        $processes | ForEach-Object {
            $pid = $_
            if ($pid -and $pid -match '^\d+$') {
                try {
                    Write-Host "🔫 Killing process $pid..." -ForegroundColor Red
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Process $pid terminated successfully" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Failed to kill process $pid`: $_" -ForegroundColor Red
                }
            }
        }
        
        # Wait a moment for processes to fully terminate
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✅ Port $Port is available" -ForegroundColor Green
    }
}

# Kill any processes on port 3000
Stop-ProcessOnPort -Port 3000

# Start the Next.js development server
Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Green
Write-Host "📱 Your app will be available at: http://localhost:3000" -ForegroundColor Cyan

# Start the dev server with explicit port
npm run dev -- --port 3000
