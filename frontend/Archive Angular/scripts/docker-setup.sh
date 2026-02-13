#!/bin/bash

# FamLink Docker Setup Script
# This script helps set up the Docker environment for FamLink

set -e

echo "🚀 Setting up FamLink Docker environment..."

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs/nginx
mkdir -p nginx/ssl
mkdir -p monitoring

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please update the .env file with your actual configuration values!"
fi

# Generate JWT secret if not set
if ! grep -q "JWT_SECRET_KEY=your_jwt_secret_key" .env; then
    print_status "JWT secret already configured"
else
    print_status "Generating JWT secret key..."
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/JWT_SECRET_KEY=your_jwt_secret_key_here_make_it_long_and_random/JWT_SECRET_KEY=$JWT_SECRET/" .env
fi

# Generate encryption key if not set
if ! grep -q "ENCRYPTION_KEY=your_32_character_encryption_key" .env; then
    print_status "Encryption key already configured"
else
    print_status "Generating encryption key..."
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    sed -i "s/ENCRYPTION_KEY=your_32_character_encryption_key_here/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
fi

# Build and start services
print_status "Building Docker images..."
docker-compose build

print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."
docker-compose ps

# Run database migrations
print_status "Running database migrations..."
docker-compose exec backend python scripts/run_migration.py

print_status "✅ FamLink Docker environment is ready!"
print_status "🌐 Frontend: http://localhost:4200"
print_status "🔧 Backend API: http://localhost:8000"
print_status "📊 API Documentation: http://localhost:8000/docs"
print_status "🗄️  Database: localhost:5432"
print_status "🔴 Redis: localhost:6379"

echo ""
print_warning "Don't forget to:"
echo "1. Update your .env file with actual AWS Cognito credentials"
echo "2. Configure your OpenAI API key for AI features"
echo "3. Set up proper SSL certificates for production"
echo ""

print_status "To stop the services, run: docker-compose down"
print_status "To view logs, run: docker-compose logs -f [service-name]"