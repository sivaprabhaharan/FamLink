# FamLink - Family Health & Community Platform

A comprehensive full-stack web application designed for parents and children, featuring community interactions, medical record management, hospital services, and AI-powered pediatric assistance.

## Project Structure

```
FamLink/
├── frontend/          # Angular + Tailwind CSS frontend
├── backend/           # .NET C# Web API
├── database/          # SQL Server schemas and migrations
├── docs/              # Documentation and design files
└── README.md
```

## Tech Stack

### Frontend
- **Framework**: Angular 17+
- **Styling**: Tailwind CSS
- **Features**: Dark/Light theme, Responsive design, PWA support
- **Authentication**: AWS Cognito integration
- **Deployment**: AWS Amplify

### Backend
- **Framework**: .NET 8 C# Web API
- **Database**: SQL Server on AWS RDS
- **Authentication**: AWS Cognito
- **Storage**: AWS S3 for media files
- **Deployment**: AWS ECS Fargate

### Key Features
- 👥 **Community Hub**: Parent interactions and experience sharing
- 🏥 **Medical Records**: Secure child health record storage
- 📍 **Hospital Locator**: Find and book appointments
- 🤖 **AI Pediatrician**: Evidence-based health advice chatbot
- 🔐 **Secure Authentication**: AWS Cognito integration
- 📱 **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI
- .NET 8 SDK
- SQL Server
- AWS CLI configured

### Development Setup
1. Clone the repository
2. Set up frontend: `cd frontend && npm install`
3. Set up backend: `cd backend && dotnet restore`
4. Configure environment variables
5. Run database migrations
6. Start development servers

## Development Approach
Using "vibe coding" principles - intuitive, modular, and visually engaging development with focus on developer experience and maintainability.