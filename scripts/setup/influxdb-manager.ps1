# InfluxDB Container Management Script for UrjaBandhu (PowerShell)
# This script provides easy management of InfluxDB container on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'create', 'remove', 'logs', 'info', 'test', 'shell', 'cli', 'menu')]
    [string]$Command = 'menu'
)

# InfluxDB Configuration
$INFLUXDB_CONTAINER_NAME = "urjabandhu-influxdb-1"
$INFLUXDB_IMAGE = "influxdb:2.7"
$INFLUXDB_PORT = "8086"
$INFLUXDB_ORG = "urjabandhu"
$INFLUXDB_BUCKET = "electricity_data"
$INFLUXDB_USERNAME = "admin"
$INFLUXDB_PASSWORD = "password123"
$INFLUXDB_TOKEN = "urjabandhu-token-2024"

Write-Host "🔧 InfluxDB Container Management for UrjaBandhu" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Host "✅ Docker is running" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        exit 1
    }
}

# Function to check container status
function Get-ContainerStatus {
    $running = docker ps -q -f name=$INFLUXDB_CONTAINER_NAME
    $exists = docker ps -a -q -f name=$INFLUXDB_CONTAINER_NAME
    
    if ($running) {
        Write-Host "✅ InfluxDB container is running" -ForegroundColor Green
        return "running"
    }
    elseif ($exists) {
        Write-Host "⚠️  InfluxDB container exists but is stopped" -ForegroundColor Yellow
        return "stopped"
    }
    else {
        Write-Host "❌ InfluxDB container does not exist" -ForegroundColor Red
        return "not-exists"
    }
}

# Function to create and start InfluxDB container
function New-InfluxDBContainer {
    Write-Host "🚀 Creating InfluxDB container..." -ForegroundColor Blue
    
    docker run -d `
        --name $INFLUXDB_CONTAINER_NAME `
        -p "${INFLUXDB_PORT}:8086" `
        -e DOCKER_INFLUXDB_INIT_MODE=setup `
        -e DOCKER_INFLUXDB_INIT_USERNAME=$INFLUXDB_USERNAME `
        -e DOCKER_INFLUXDB_INIT_PASSWORD=$INFLUXDB_PASSWORD `
        -e DOCKER_INFLUXDB_INIT_ORG=$INFLUXDB_ORG `
        -e DOCKER_INFLUXDB_INIT_BUCKET=$INFLUXDB_BUCKET `
        -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=$INFLUXDB_TOKEN `
        -v influxdb_data:/var/lib/influxdb2 `
        -v influxdb_config:/etc/influxdb2 `
        --restart unless-stopped `
        $INFLUXDB_IMAGE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ InfluxDB container created and started" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create container" -ForegroundColor Red
    }
}

# Function to start existing container
function Start-InfluxDBContainer {
    Write-Host "▶️  Starting InfluxDB container..." -ForegroundColor Blue
    docker start $INFLUXDB_CONTAINER_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ InfluxDB container started" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start container" -ForegroundColor Red
    }
}

# Function to stop container
function Stop-InfluxDBContainer {
    Write-Host "⏹️  Stopping InfluxDB container..." -ForegroundColor Blue
    docker stop $INFLUXDB_CONTAINER_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ InfluxDB container stopped" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to stop container" -ForegroundColor Red
    }
}

# Function to restart container
function Restart-InfluxDBContainer {
    Write-Host "🔄 Restarting InfluxDB container..." -ForegroundColor Blue
    docker restart $INFLUXDB_CONTAINER_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ InfluxDB container restarted" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to restart container" -ForegroundColor Red
    }
}

# Function to remove container
function Remove-InfluxDBContainer {
    Write-Host "⚠️  This will remove the InfluxDB container (data will be preserved in volumes)" -ForegroundColor Yellow
    $confirmation = Read-Host "Are you sure? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker rm -f $INFLUXDB_CONTAINER_NAME 2>$null
        Write-Host "✅ InfluxDB container removed" -ForegroundColor Green
    } else {
        Write-Host "Operation cancelled" -ForegroundColor Blue
    }
}

# Function to show container logs
function Show-InfluxDBLogs {
    Write-Host "📋 InfluxDB container logs (last 50 lines):" -ForegroundColor Blue
    docker logs $INFLUXDB_CONTAINER_NAME --tail 50
}

# Function to show container status and info
function Show-InfluxDBInfo {
    Write-Host "📊 InfluxDB Container Information:" -ForegroundColor Blue
    Write-Host "==================================" -ForegroundColor Blue
    Write-Host "Container Name: $INFLUXDB_CONTAINER_NAME"
    Write-Host "Image: $INFLUXDB_IMAGE"
    Write-Host "Port: $INFLUXDB_PORT"
    Write-Host "Organization: $INFLUXDB_ORG"
    Write-Host "Bucket: $INFLUXDB_BUCKET"
    Write-Host "Username: $INFLUXDB_USERNAME"
    Write-Host "Web UI: http://localhost:$INFLUXDB_PORT"
    Write-Host ""
    
    $status = Get-ContainerStatus
    if ($status -eq "running") {
        docker ps -f name=$INFLUXDB_CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
}

# Function to test connection
function Test-InfluxDBConnection {
    Write-Host "🔌 Testing InfluxDB connection..." -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$INFLUXDB_PORT/ping" -Method GET -ErrorAction Stop
        if ($response.StatusCode -eq 204) {
            Write-Host "✅ InfluxDB is responding on port $INFLUXDB_PORT" -ForegroundColor Green
            
            # Test API access with token
            try {
                $headers = @{'Authorization' = "Token $INFLUXDB_TOKEN"}
                Invoke-WebRequest -Uri "http://localhost:$INFLUXDB_PORT/api/v2/buckets" -Headers $headers -Method GET -ErrorAction Stop | Out-Null
                Write-Host "✅ API access with token works" -ForegroundColor Green
            }
            catch {
                Write-Host "⚠️  API access test failed (container might still be initializing)" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "❌ InfluxDB is not responding" -ForegroundColor Red
    }
}

# Function to enter container shell
function Enter-InfluxDBShell {
    Write-Host "🐚 Entering InfluxDB container shell..." -ForegroundColor Blue
    docker exec -it $INFLUXDB_CONTAINER_NAME /bin/bash
}

# Function to run influx CLI
function Start-InfluxCLI {
    Write-Host "💻 Running InfluxDB CLI..." -ForegroundColor Blue
    docker exec -it $INFLUXDB_CONTAINER_NAME influx
}

# Function to show menu
function Show-Menu {
    Write-Host ""
    Write-Host "Please choose an option:" -ForegroundColor Blue
    Write-Host "1) Show container info and status"
    Write-Host "2) Create new container"
    Write-Host "3) Start container"
    Write-Host "4) Stop container"
    Write-Host "5) Restart container"
    Write-Host "6) Remove container"
    Write-Host "7) Show logs"
    Write-Host "8) Test connection"
    Write-Host "9) Enter container shell"
    Write-Host "10) Run InfluxDB CLI"
    Write-Host "11) Exit"
    Write-Host ""
}

# Check Docker first
Test-Docker

# Handle commands
switch ($Command) {
    'start' { Start-InfluxDBContainer }
    'stop' { Stop-InfluxDBContainer }
    'restart' { Restart-InfluxDBContainer }
    'create' { New-InfluxDBContainer }
    'remove' { Remove-InfluxDBContainer }
    'logs' { Show-InfluxDBLogs }
    'info' { Show-InfluxDBInfo }
    'test' { Test-InfluxDBConnection }
    'shell' { Enter-InfluxDBShell }
    'cli' { Start-InfluxCLI }
    'menu' {
        # Interactive menu
        do {
            Show-Menu
            $choice = Read-Host "Enter your choice (1-11)"
            
            switch ($choice) {
                '1' { Show-InfluxDBInfo }
                '2' { New-InfluxDBContainer }
                '3' { Start-InfluxDBContainer }
                '4' { Stop-InfluxDBContainer }
                '5' { Restart-InfluxDBContainer }
                '6' { Remove-InfluxDBContainer }
                '7' { Show-InfluxDBLogs }
                '8' { Test-InfluxDBConnection }
                '9' { Enter-InfluxDBShell }
                '10' { Start-InfluxCLI }
                '11' { 
                    Write-Host "Goodbye!" -ForegroundColor Green
                    exit 0 
                }
                default { 
                    Write-Host "Invalid option. Please try again." -ForegroundColor Red 
                }
            }
            
            if ($choice -ne '11') {
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
        } while ($choice -ne '11')
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Available commands: start, stop, restart, create, remove, logs, info, test, shell, cli, menu"
    }
}
