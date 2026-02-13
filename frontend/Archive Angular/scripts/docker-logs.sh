#!/bin/bash

# FamLink Docker Logs Script
# This script helps view logs from different services

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [service] [options]"
    echo ""
    echo "Services:"
    echo "  backend    - FastAPI backend logs"
    echo "  frontend   - Angular frontend logs"
    echo "  postgres   - PostgreSQL database logs"
    echo "  redis      - Redis cache logs"
    echo "  nginx      - Nginx proxy logs"
    echo "  all        - All services logs"
    echo ""
    echo "Options:"
    echo "  -f, --follow    Follow log output"
    echo "  -t, --tail N    Show last N lines (default: 100)"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backend -f"
    echo "  $0 all --tail 50"
    echo "  $0 postgres"
}

# Default values
SERVICE=""
FOLLOW=""
TAIL="100"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        backend|frontend|postgres|redis|nginx|all)
            SERVICE="$1"
            shift
            ;;
        -f|--follow)
            FOLLOW="-f"
            shift
            ;;
        -t|--tail)
            TAIL="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if service is specified
if [ -z "$SERVICE" ]; then
    echo "Error: Please specify a service"
    show_usage
    exit 1
fi

# Show logs
if [ "$SERVICE" = "all" ]; then
    print_status "Showing logs for all services (last $TAIL lines)..."
    docker-compose logs --tail="$TAIL" $FOLLOW
else
    print_status "Showing logs for $SERVICE (last $TAIL lines)..."
    docker-compose logs --tail="$TAIL" $FOLLOW "$SERVICE"
fi