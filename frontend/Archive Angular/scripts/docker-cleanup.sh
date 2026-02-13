#!/bin/bash

# FamLink Docker Cleanup Script
# This script helps clean up Docker resources for FamLink

set -e

echo "🧹 Cleaning up FamLink Docker environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Ask for confirmation
read -p "This will stop and remove all FamLink containers, networks, and volumes. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleanup cancelled."
    exit 0
fi

# Stop and remove containers
print_status "Stopping and removing containers..."
docker-compose down -v --remove-orphans

# Remove images
print_status "Removing FamLink images..."
docker images | grep famlink | awk '{print $3}' | xargs -r docker rmi -f

# Remove unused volumes
print_status "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
print_status "Removing unused networks..."
docker network prune -f

# Remove unused images
print_status "Removing unused images..."
docker image prune -f

print_status "✅ Cleanup completed!"
print_status "To rebuild the environment, run: ./scripts/docker-setup.sh"