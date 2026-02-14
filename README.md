# FamLink - Family Health & Community Platform

A comprehensive full-stack web application designed for parents and caregivers to manage their children's health, connect with community, and access AI-powered FamBot AI which just doesn't chat but does actions for you like adding a chidren, booking appointment, creating a post in the community or getting information from the posts available in the community.

## Project Overview

**FamLink** is a React frontend platform designed for parents and caregivers to manage their children's health, connect with community, and access AI-powered FamBot AI. The backend API is currently under reconstruction and will be rebuilt using Python (Flask/FastAPI) in the next phase.

## Project Structure

```
FamLink/
├── backend/                    # [PLANNED] Python Backend (Flask/FastAPI)
│   ├── app/
│   │   ├── routes/             # API endpoints (planned)
│   │   ├── models/             # Database models (planned)
│   │   └── services/           # Business logic (planned)
│   ├── Dockerfile              # Container configuration (planned)
│   ├── requirements.txt        # Python dependencies (planned)
│   └── .env.example            # Environment template (planned)
├── frontend/
│   └── react-app/              # React + Vite + TypeScript
│       ├── src/
│       │   ├── components/     # Reusable components
│       │   ├── features/       # Feature modules
│       │   ├── context/        # State management
│       │   ├── layouts/        # Layout components
│       │   └── App.tsx         # Main application
│       └── package.json
├── DEPLOYMENT.md               # Infrastructure & deployment guide
└── README.md                   # This file
```

## Tech Stack

### Frontend
- **Framework**: React 18+ with React Router
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark mode support
- **HTTP Client**: Axios
- **State Management**: React Context API
- **UI Icons**: Lucide React
- **Authentication**: Local storage-based (simulated, ready for AWS Cognito)

### Backend (Planned - Python Rebuild)
- **Framework**: Flask or FastAPI (to be decided)
- **Language**: Python 3.10+
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy or similar (to be decided)
- **API Documentation**: OpenAPI/Swagger
- **Testing**: pytest framework

### Infrastructure & Cloud (Planned/Configured)
- **Authentication**: AWS Cognito (configured but not fully integrated)
- **Storage**: AWS S3 (interface implemented, awaiting S3 client)
- **AI Services**: OpenAI-compatible API (interface ready)
- **Deployment**: AWS ECS Fargate + Docker
- **Database**: AWS RDS SQL Server

## Features Status

### ✅ Implemented & Functional

#### Backend API (Archived/Deleted)
**Note**: The .NET backend was removed and will be rebuilt with Python. Design specs are preserved below:
- **Users Management**: User profiles, activation status tracking
- **Children Management**: Store child profiles with medical info (DOB, blood type, allergies, medical conditions, emergency contacts)
- **Medical Records**: Track and retrieve medical records by type and date range with file associations
- **Community Hub**: 
  - Posts with categories and search functionality
  - Comments on community posts
  - Like functionality for posts
  - Pagination support
- **Hospital Services**: 
  - Hospital search by location (city, state)
  - Specialty-based filtering
  - Geolocation-based radius search
  - Appointment tracking
- **AI-Powered Chatbot Infrastructure**: 
  - Conversation storage and retrieval
  - User conversation history with pagination
  - Child context integration for pediatric advice
  - Action-based tool system for task automation
- **API Documentation**: Swagger UI available at root endpoint
- **Health Monitoring**: `/health` and `/api/info` endpoints

#### Frontend UI/UX
- **Authentication**: Login page with local auth (simulated)
- **Protected Routes**: Role-based route protection
- **Dashboard**: Welcome page with layout
- **Children Management**: 
  - View list of children with card-based layout
  - Add child modal with form validation
  - Display child information (name, DOB, gender, blood group, allergies)
  - Mock data integration for testing
- **Navigation**: Sidebar layout with dark/light theme support
- **Responsive Design**: Mobile-optimized layouts
- **Loading States**: Spinner animations for async operations
- **Chatbot Widget Integration**: Foundation for intelligent assistant interface

### 🟡 Partially Implemented (Infrastructure Ready)

- **AI-Powered Chatbot** (`/chatbot`) - Smart Assistant with Action Capabilities: 
  - **Tool-Based Actions**: Not just chat! The chatbot can perform real actions including:
    - Add/manage child profiles
    - Retrieve medical records
    - Search and book hospital appointments
    - Get pediatric health advice
    - Access community posts and discussions
  - Frontend placeholder exists with AgentService tool definitions
  - Awaiting Python backend API for conversation persistence
  - Awaiting OpenAI/Claude API integration in new Python backend
  - Awaiting full chat interface UI implementation
  - Will support natural language commands for common family health tasks

- **AWS Integration** (Frontend Ready):
  - S3 integration logic prepared
  - Awaiting Python backend implementation
  - Placeholder implementations present for testing

- **AI Service** (Frontend Ready):
  - AgentService interface defined with pediatric advice capabilities
  - Tool definitions for health advice and child management
  - Awaiting actual OpenAI/Claude API integration in Python backend
  - Placeholder implementations using mock responses

### ⏳ Not Yet Implemented

**Backend (Top Priority)**:
- [ ] Python backend framework setup (Flask or FastAPI)
- [ ] Database schema and models
- [ ] API endpoints for all features
- [ ] Authentication system
- [ ] AWS S3 integration
- [ ] OpenAI/Claude API integration
- [ ] Docker containerization

**Frontend Features**:
- [ ] User Profile Pages: Profile viewing and editing
- [ ] Settings: User preferences and application settings
- [ ] Medical Record Upload: File upload UI and integration
- [ ] Hospital Appointment Booking: Full booking workflow
- [ ] Community Features UI: Frontend for posts, comments, likes
- [ ] AI Chatbot UI: Interactive chatbot widget with real AI responses
- [ ] Advanced Search: Complex filtering across multiple models
- [ ] Notifications: Real-time notifications for community and medical events
- [ ] Data Export: Export medical records and health data
- [ ] Multi-language Support: Internationalization
- [ ] Accessibility Features: ARIA labels and keyboard navigation enhancements
- [ ] Analytics: User behavior and health trend analytics

## Current Database Models

**Note**: These are the database models designed for the new Python backend. Schema specifications are below for reference:

1. **User**: Parent/caregiver profiles with location info
2. **Child**: Child profiles with medical metadata
3. **MedicalRecord**: Health records linked to children
4. **Appointment**: Healthcare provider appointments
5. **Hospital**: Healthcare facility directory
6. **CommunityPost**: Community discussion posts
7. **CommunityComment**: Comments on posts
8. **CommunityLike**: Like tracking for posts
9. **ChatbotConversation**: AI conversation history

## Setup & Installation

For complete setup and installation instructions, please refer to the folder-specific README files:

### Frontend Setup
See [frontend/react-app/README.md](frontend/react-app/README.md) for:
- Prerequisites and dependencies
- Installation steps
- Development server setup
- Build and deployment instructions
- Environment configuration
- Test credentials

### Backend Setup
See [backend/README.md](backend/README.md) for:
- Prerequisites and Python dependencies
- Virtual environment setup
- Database configuration
- API server setup
- Environment variables
- Docker containerization
- Deployment instructions

## Next Steps & Roadmap

### Phase 1.5 (IMMEDIATE - Backend Rebuild)
- [ ] Set up Python backend project (Flask/FastAPI)
- [ ] Design and implement database schema
- [ ] Create ORM models and migrations
- [ ] Implement core API endpoints (Users, Children, Medical Records)
- [ ] Set up authentication system
- [ ] Implement AWS S3 integration
- [ ] Set up Docker containerization
- [ ] Implement OpenAI/Claude chatbot integration

### Phase 2 (Near-term - Backend Completion)
- [ ] Complete Hospital and Community endpoints
- [ ] Implement Chatbot endpoints
- [ ] Add comprehensive API documentation
- [ ] Set up testing suite (pytest)
- [ ] Implement error handling and logging
- [ ] Set up CI/CD pipeline

### Phase 3 (Frontend Completion)
- [ ] Complete chatbot UI with conversation interface
- [ ] Build community feature UI (posts, comments, likes)
- [ ] Create user profile and settings pages
- [ ] Medical record upload and document management
- [ ] Hospital appointment booking interface
- [ ] Advanced search and filtering

### Phase 4 (Polish & Scale)
- [ ] Real-time features (WebSockets)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile native app (React Native)
- [ ] Pediatrician integration platform

## Notes

- **Backend Status**: The .NET backend was removed. Rebuilding with Python (Flask/FastAPI) is the next priority.
- **Current Auth**: Frontend uses simulated local authentication for development. Real authentication will be implemented in the Python backend.
- **Frontend State**: Fully functional React app with mock data. Ready to connect to Python backend APIs once they're created.
- **API Design**: All endpoint specifications are preserved and documented above. Ready for Python backend implementation.
- **Database**: Schema design from the .NET version is available for reference when building Python models.
- **Development Mode**: The frontend currently runs in demo mode with mock services. Backend will integrate real data once ready.

## Support & Documentation

See `DEPLOYMENT.md` for infrastructure setup and AWS deployment instructions.
