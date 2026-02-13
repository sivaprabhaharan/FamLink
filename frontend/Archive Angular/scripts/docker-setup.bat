@echo off
REM FamLink Docker Setup Script for Windows
REM This script helps set up the Docker environment for FamLink

echo 🚀 Setting up FamLink Docker environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "logs\nginx" mkdir logs\nginx
if not exist "nginx\ssl" mkdir nginx\ssl
if not exist "monitoring" mkdir monitoring

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy .env.example .env
    echo [WARNING] Please update the .env file with your actual configuration values!
)

REM Build and start services
echo [INFO] Building Docker images...
docker-compose build

echo [INFO] Starting services...
docker-compose up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo [INFO] Checking service health...
docker-compose ps

REM Run database migrations
echo [INFO] Running database migrations...
docker-compose exec backend python scripts/run_migration.py

echo [INFO] ✅ FamLink Docker environment is ready!
echo [INFO] 🌐 Frontend: http://localhost:4200
echo [INFO] 🔧 Backend API: http://localhost:8000
echo [INFO] 📊 API Documentation: http://localhost:8000/docs
echo [INFO] 🗄️  Database: localhost:5432
echo [INFO] 🔴 Redis: localhost:6379

echo.
echo [WARNING] Don't forget to:
echo 1. Update your .env file with actual AWS Cognito credentials
echo 2. Configure your OpenAI API key for AI features
echo 3. Set up proper SSL certificates for production
echo.

echo [INFO] To stop the services, run: docker-compose down
echo [INFO] To view logs, run: docker-compose logs -f [service-name]

pause