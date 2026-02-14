# FamLink Frontend

A modern React application for **FamLink**, a family management platform designed to help parents manage their children's information and daily activities with the help of an AI assistant.

This repository contains the frontend application built with **React**, **TypeScript**, and **Vite**.

## 🚀 Features

-   **Dashboard**: Overview of family activities and status.
-   **Child Management**: Track children's profiles, including medical details (blood group, allergies) and notes.
-   **FamBot AI Assistant**:
    -   Integrated conversational AI powered by a local LLM (via LM Studio).
    -   Capable of performing actions like adding children or retrieving family info through natural language.
-   **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.

## 🛠 Tech Stack

-   **Framework**: [React 19](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Routing**: [React Router v7](https://reactrouter.com/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   **Optional (for AI features)**: [LM Studio](https://lmstudio.ai/) running locally.

## 📦 Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd FamLink/frontend/react-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## 🏃‍♂️ Running the Application

### Development Server
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Setting up the AI Assistant (FamBot)
To use the Chatbot features:
1.  Install and launch [LM Studio](https://lmstudio.ai/).
2.  Load a model (e.g., `qwen/qwen3-4b-2507` or any compatible model).
3.  Start the Local Inference Server on port `1234` (default).
4.  Ensure Cross-Origin Resource Sharing (CORS) is enabled in LM Studio settings if necessary.

## 🏗 Project Structure

```
src/
├── features/        # Feature-based architecture
│   ├── auth/        # Authentication logic
│   ├── chatbot/     # FamBot AI Agent implementation
│   ├── children/    # Children management (Mock Service)
│   └── dashboard/   # Main dashboard view
├── components/      # Shared UI components
├── layouts/         # App layouts (Main, Auth, etc.)
└── context/         # Global state context
```

## 🗓 Roadmap (Phase 1)
-   [x] Basic Project Setup (React+Vite)
-   [x] Mock Data Services for Children
-   [x] AI Agent Integration (Local LLM)
-   [ ] Backend API Integration (.NET)
-   [ ] Authentication with Identity Provider

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
