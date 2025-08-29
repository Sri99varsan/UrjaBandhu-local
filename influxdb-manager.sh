#!/bin/bash
# InfluxDB Container Management Script for UrjaBandhu
# This script provides easy management of InfluxDB container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# InfluxDB Configuration
INFLUXDB_CONTAINER_NAME="urjabandhu-influxdb-1"
INFLUXDB_IMAGE="influxdb:2.7"
INFLUXDB_PORT="8086"
INFLUXDB_ORG="urjabandhu"
INFLUXDB_BUCKET="electricity_data"
INFLUXDB_USERNAME="admin"
INFLUXDB_PASSWORD="password123"
INFLUXDB_TOKEN="urjabandhu-token-2024"

echo -e "${BLUE}🔧 InfluxDB Container Management for UrjaBandhu${NC}"
echo "================================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to check container status
check_container_status() {
    if docker ps -q -f name=$INFLUXDB_CONTAINER_NAME | grep -q .; then
        echo -e "${GREEN}✅ InfluxDB container is running${NC}"
        return 0
    elif docker ps -a -q -f name=$INFLUXDB_CONTAINER_NAME | grep -q .; then
        echo -e "${YELLOW}⚠️  InfluxDB container exists but is stopped${NC}"
        return 1
    else
        echo -e "${RED}❌ InfluxDB container does not exist${NC}"
        return 2
    fi
}

# Function to create and start InfluxDB container
create_container() {
    echo -e "${BLUE}🚀 Creating InfluxDB container...${NC}"
    
    docker run -d \
        --name $INFLUXDB_CONTAINER_NAME \
        -p $INFLUXDB_PORT:8086 \
        -e DOCKER_INFLUXDB_INIT_MODE=setup \
        -e DOCKER_INFLUXDB_INIT_USERNAME=$INFLUXDB_USERNAME \
        -e DOCKER_INFLUXDB_INIT_PASSWORD=$INFLUXDB_PASSWORD \
        -e DOCKER_INFLUXDB_INIT_ORG=$INFLUXDB_ORG \
        -e DOCKER_INFLUXDB_INIT_BUCKET=$INFLUXDB_BUCKET \
        -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=$INFLUXDB_TOKEN \
        -v influxdb_data:/var/lib/influxdb2 \
        -v influxdb_config:/etc/influxdb2 \
        --restart unless-stopped \
        $INFLUXDB_IMAGE
    
    echo -e "${GREEN}✅ InfluxDB container created and started${NC}"
}

# Function to start existing container
start_container() {
    echo -e "${BLUE}▶️  Starting InfluxDB container...${NC}"
    docker start $INFLUXDB_CONTAINER_NAME
    echo -e "${GREEN}✅ InfluxDB container started${NC}"
}

# Function to stop container
stop_container() {
    echo -e "${BLUE}⏹️  Stopping InfluxDB container...${NC}"
    docker stop $INFLUXDB_CONTAINER_NAME
    echo -e "${GREEN}✅ InfluxDB container stopped${NC}"
}

# Function to restart container
restart_container() {
    echo -e "${BLUE}🔄 Restarting InfluxDB container...${NC}"
    docker restart $INFLUXDB_CONTAINER_NAME
    echo -e "${GREEN}✅ InfluxDB container restarted${NC}"
}

# Function to remove container
remove_container() {
    echo -e "${YELLOW}⚠️  This will remove the InfluxDB container (data will be preserved in volumes)${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker rm -f $INFLUXDB_CONTAINER_NAME 2>/dev/null || true
        echo -e "${GREEN}✅ InfluxDB container removed${NC}"
    else
        echo -e "${BLUE}Operation cancelled${NC}"
    fi
}

# Function to show container logs
show_logs() {
    echo -e "${BLUE}📋 InfluxDB container logs (last 50 lines):${NC}"
    docker logs $INFLUXDB_CONTAINER_NAME --tail 50
}

# Function to show container status and info
show_info() {
    echo -e "${BLUE}📊 InfluxDB Container Information:${NC}"
    echo "=================================="
    echo "Container Name: $INFLUXDB_CONTAINER_NAME"
    echo "Image: $INFLUXDB_IMAGE"
    echo "Port: $INFLUXDB_PORT"
    echo "Organization: $INFLUXDB_ORG"
    echo "Bucket: $INFLUXDB_BUCKET"
    echo "Username: $INFLUXDB_USERNAME"
    echo "Web UI: http://localhost:$INFLUXDB_PORT"
    echo ""
    
    if check_container_status; then
        echo -e "${GREEN}Status: Running${NC}"
        docker ps -f name=$INFLUXDB_CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo -e "${RED}Status: Not running${NC}"
    fi
}

# Function to test connection
test_connection() {
    echo -e "${BLUE}🔌 Testing InfluxDB connection...${NC}"
    
    if curl -f -s http://localhost:$INFLUXDB_PORT/ping > /dev/null; then
        echo -e "${GREEN}✅ InfluxDB is responding on port $INFLUXDB_PORT${NC}"
        
        # Test API access with token
        if curl -s -H "Authorization: Token $INFLUXDB_TOKEN" \
                http://localhost:$INFLUXDB_PORT/api/v2/buckets > /dev/null; then
            echo -e "${GREEN}✅ API access with token works${NC}"
        else
            echo -e "${YELLOW}⚠️  API access test failed (container might still be initializing)${NC}"
        fi
    else
        echo -e "${RED}❌ InfluxDB is not responding${NC}"
    fi
}

# Function to enter container shell
enter_shell() {
    echo -e "${BLUE}🐚 Entering InfluxDB container shell...${NC}"
    docker exec -it $INFLUXDB_CONTAINER_NAME /bin/bash
}

# Function to run influx CLI
run_influx_cli() {
    echo -e "${BLUE}💻 Running InfluxDB CLI...${NC}"
    docker exec -it $INFLUXDB_CONTAINER_NAME influx
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Please choose an option:${NC}"
    echo "1) Show container info and status"
    echo "2) Create new container"
    echo "3) Start container"
    echo "4) Stop container"
    echo "5) Restart container"
    echo "6) Remove container"
    echo "7) Show logs"
    echo "8) Test connection"
    echo "9) Enter container shell"
    echo "10) Run InfluxDB CLI"
    echo "11) Exit"
    echo ""
}

# Check Docker first
check_docker

# If no arguments provided, show menu
if [ $# -eq 0 ]; then
    while true; do
        show_menu
        read -p "Enter your choice (1-11): " choice
        
        case $choice in
            1) show_info ;;
            2) create_container ;;
            3) start_container ;;
            4) stop_container ;;
            5) restart_container ;;
            6) remove_container ;;
            7) show_logs ;;
            8) test_connection ;;
            9) enter_shell ;;
            10) run_influx_cli ;;
            11) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
else
    # Handle command line arguments
    case $1 in
        "start") start_container ;;
        "stop") stop_container ;;
        "restart") restart_container ;;
        "create") create_container ;;
        "remove") remove_container ;;
        "logs") show_logs ;;
        "info") show_info ;;
        "test") test_connection ;;
        "shell") enter_shell ;;
        "cli") run_influx_cli ;;
        *) 
            echo -e "${RED}Unknown command: $1${NC}"
            echo "Available commands: start, stop, restart, create, remove, logs, info, test, shell, cli"
            exit 1
            ;;
    esac
fi
