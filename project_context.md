# FamLink Project Context

## 1. Project Overview
**FamLink** is a comprehensive family health and community platform. It allows parents and caregivers to manage their children's health, connect with a community, and access an AI-powered assistant ("FamBot").

- **Primary Goal**: Manage family health data and provide AI-assisted support.
- **Current State**: 
  - **Frontend**: Fully functional React application with mock data services and local LLM integration.
  - **Backend**: Currently planned for rebuild in Python (Flask/FastAPI). Previous .NET backend was removed.

## 2. Technical Stack

### Frontend (`frontend/react-app`)
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **AI Integration**: Local LLM via LM Studio (OpenAI-compatible API)

### Backend (Planned)
- **Language**: Python 3.10+
- **Framework**: Flask or FastAPI
- **Database**: PostgreSQL
- **Key Features needed**: Authentication, CRUD for Children/Medical Records, Vector Database for AI context.

### Infrastructure
- **Deployment**: AWS (ECS Fargate, RDS, S3) - see `DEPLOYMENT.md`.
- **CI/CD**: Planned.

## 3. Project Structure
```
FamLink/
├── backend/                    # [PLANNED] Python Backend
├── frontend/
│   └── react-app/              # Main React Application
│       ├── src/
│       │   ├── features/       # Feature-based architecture
│       │   │   ├── auth/       # Login/Auth logic
│       │   │   ├── chatbot/    # FamBot AI Agent & Service
│       │   │   ├── children/   # Child management & Services
│       │   │   └── dashboard/  # Main dashboard
│       │   ├── components/     # Shared UI components
│       │   ├── context/        # Global state (AuthContext)
│       │   ├── layouts/        # App layouts
│       │   ├── App.tsx         # Routing & Entry
│       │   └── main.tsx        # Render entry
│       └── package.json
└── DEPLOYMENT.md               # AWS Deployment Guide
```

## 4. Key Features & Data Models

### A. Children Management (`features/children`)
Allows adding, viewing, updating, and deleting child profiles.
**Data Model (`Child`):**
```typescript
interface Child {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    allergies?: string[];
    notes?: string;
}
```
*Current Implementation*: uses `MockChildrenService` with simulated latency.

### B. FamBot AI Assistant (`features/chatbot`)
An AI agent that can chat and perform actions (Tool Calling).
**Architecture**:
- **Service**: `AgentService.ts`
- **LLM**: Connects to local LM Studio (`http://localhost:1234/v1`).
- **Tools**:
  - `getChildren`: Retrieves list of children.
  - `addChild`: Adds a new child profile.
- **Flow**: User Message -> LLM -> Tool Call (optional) -> Execute Tool -> LLM Summary -> Response.

### C. Authentication (`features/auth`)
**Current Implementation**:
- Boolean `isAuthenticated` state in `AuthContext`.
- Mock login in `Login.tsx`.
- Protected Routes wrapper in `App.tsx`.

## 5. Roadmap & Missing Pieces
1.  **Backend Implementation**: The Python backend needs to be built to replace the mock services.
2.  **Real Authentication**: Replace mock auth with JWT/OAuth/Cognito integration.
3.  **Database Integration**: Replace in-memory arrays in services with API calls to the real backend.
4.  **AI Context**: The Chatbot needs persistent conversation history and RAG (Retrieval-Augmented Generation) for community posts/medical records.

## 6. Setup Instructions
- **Frontend**: `cd frontend/react-app` -> `npm install` -> `npm run dev`.
- **AI**: Run LM Studio, load model, start server on port 1234.
