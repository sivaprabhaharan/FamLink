# FamLink Frontend

A modern Angular application for the FamLink Family Health & Community Platform, built with Angular 17, Tailwind CSS, and AWS integration.

## 🚀 Features

- **Modern Angular 17** with standalone components and signals
- **Tailwind CSS** for utility-first styling with custom design system
- **Dark/Light Theme** support with system preference detection
- **Responsive Design** optimized for mobile, tablet, and desktop
- **AWS Integration** ready for Cognito authentication and S3 storage
- **Progressive Web App** capabilities
- **Accessibility** compliant with WCAG guidelines
- **TypeScript** for type safety and better developer experience

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and components
│   │   ├── components/
│   │   │   └── navigation/      # Main navigation component
│   │   └── services/
│   │       ├── auth.service.ts  # Authentication service
│   │       ├── theme.service.ts # Theme management
│   │       └── loading.service.ts # Loading state management
│   ├── features/                # Feature modules (lazy-loaded)
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── profile/            # User profile management
│   │   ├── children/           # Children management
│   │   ├── medical-records/    # Medical records
│   │   ├── community/          # Community features
│   │   ├── hospitals/          # Hospital finder
│   │   ├── appointments/       # Appointment booking
│   │   ├── chatbot/           # AI Pediatrician chat
│   │   └── settings/          # App settings
│   ├── shared/                 # Shared components and utilities
│   │   ├── components/
│   │   │   ├── loading-spinner/
│   │   │   └── toast-container/
│   │   └── utils/
│   ├── guards/                 # Route guards
│   │   └── auth.guard.ts
│   ├── interceptors/           # HTTP interceptors
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── loading.interceptor.ts
│   ├── models/                 # TypeScript interfaces
│   └── utils/                  # Utility functions
├── assets/                     # Static assets
├── environments/               # Environment configurations
└── styles.scss                # Global styles
```

## 🛠️ Setup Instructions

### Quick Start with Docker (Recommended)

The easiest way to get FamLink running is with Docker:

1. **Prerequisites:**
   - Docker Desktop (Windows/Mac) or Docker Engine (Linux)
   - Docker Compose v2.0+

2. **Setup:**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd famlink
   
   # Run setup script
   ./scripts/docker-setup.sh    # Linux/Mac
   # or
   scripts\docker-setup.bat     # Windows
   ```

3. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

For detailed Docker setup instructions, see [DOCKER_GUIDE.md](DOCKER_GUIDE.md).

### Manual Setup (Development)

If you prefer to run without Docker:

#### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Angular CLI 17+

#### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Angular CLI globally (if not already installed):**
   ```bash
   npm install -g @angular/cli@17
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   ng serve
   ```

#### Backend Setup

1. **Setup Python environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup database:**
   ```bash
   # Create PostgreSQL database
   createdb famlink
   
   # Run migrations
   python scripts/run_migration.py
   ```

4. **Start the backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Development Login Credentials

- Email: `demo@famlink.com`
- Password: `demo123`

### Building

1. **Build for production:**
   ```bash
   npm run build:prod
   # or
   ng build --configuration production
   ```

2. **Build output:**
   The build artifacts will be stored in the `dist/` directory.

## 🎨 Design System

### Colors

The application uses a comprehensive color system with support for dark mode:

- **Primary**: Blue tones for main actions and branding
- **Secondary**: Green tones for success states and secondary actions
- **Accent**: Purple tones for highlights and special elements
- **Neutral**: Gray tones for text and backgrounds

### Typography

- **Font Family**: Inter (primary), JetBrains Mono (monospace)
- **Responsive Typography**: Scales appropriately across devices
- **Accessibility**: High contrast ratios and readable font sizes

### Components

Pre-built component classes available:

- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`
- **Cards**: `.card`, `.card-hover`, `.card-interactive`
- **Inputs**: `.input`, `.input-error`, `.input-success`
- **Badges**: `.badge`, `.badge-primary`, `.badge-success`, etc.
- **Navigation**: `.nav-link`, `.nav-link-active`, `.nav-link-inactive`

## 🔐 Authentication

The application supports multiple authentication methods:

### Development Mode
- Mock authentication with demo credentials
- Local storage for session management
- Automatic token refresh simulation

### Production Mode
- AWS Cognito integration
- JWT token management
- Secure session handling
- Multi-factor authentication support

### Configuration

Update `src/environments/environment.ts` and `environment.prod.ts`:

```typescript
aws: {
  region: 'us-east-1',
  cognito: {
    userPoolId: 'your-user-pool-id',
    clientId: 'your-client-id',
    domain: 'your-cognito-domain'
  }
}
```

## 🌙 Theme System

### Features
- **System Theme Detection**: Automatically detects user's system preference
- **Manual Toggle**: Users can manually switch between light/dark modes
- **Persistent Settings**: Theme preference saved in localStorage
- **Smooth Transitions**: Animated theme switching

### Usage

```typescript
// In components
constructor(private themeService: ThemeService) {}

// Toggle theme
this.themeService.toggleTheme();

// Set specific theme
this.themeService.setTheme('dark');

// Check current theme
const isDark = this.themeService.isDark();
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Navigation
- **Desktop**: Fixed sidebar navigation
- **Mobile**: Collapsible overlay navigation
- **Tablet**: Adaptive based on screen orientation

## 🔧 Configuration

### Environment Variables

#### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  // ... other config
};
```

#### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.famlink.com/api',
  // ... other config
};
```

### Feature Flags

Control feature availability:

```typescript
features: {
  enableChatbot: true,
  enableCommunity: true,
  enableMedicalRecords: true,
  enableAppointments: true,
  enableNotifications: true,
  enableAnalytics: false // Disabled in development
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
# or
ng test
```

### E2E Tests
```bash
npm run e2e
# or
ng e2e
```

### Linting
```bash
npm run lint
# or
ng lint
```

## 📦 Deployment

### AWS Amplify

1. **Initialize Amplify:**
   ```bash
   npm install -g @aws-amplify/cli
   amplify init
   ```

2. **Add hosting:**
   ```bash
   amplify add hosting
   ```

3. **Deploy:**
   ```bash
   amplify publish
   ```

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build:prod
   ```

2. **Deploy the `dist/` folder** to your hosting provider

## 🔍 Troubleshooting

### Common Issues

1. **TypeScript Errors**: Install Angular dependencies first
2. **Tailwind Not Working**: Ensure PostCSS is configured correctly
3. **Theme Not Persisting**: Check localStorage permissions
4. **API Errors**: Verify environment configuration

### Development Tips

1. **Hot Reload**: Use `ng serve` for automatic reloading
2. **Debug Mode**: Enable in environment configuration
3. **Network Issues**: Check CORS settings in backend
4. **Performance**: Use lazy loading for feature modules

## 📚 Documentation

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages
5. Ensure accessibility compliance

## 📄 License

This project is part of the FamLink platform. All rights reserved.