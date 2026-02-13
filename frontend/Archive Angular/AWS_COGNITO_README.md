# AWS Cognito Integration with AWS Amplify

This project uses AWS Amplify for seamless integration with AWS Cognito for authentication. The implementation provides a complete authentication flow including sign-up, sign-in, email confirmation, and password reset.

## Features

- **Sign Up**: Create new user accounts with email verification
- **Sign In**: Authenticate users with email and password
- **Email Confirmation**: Verify email addresses with confirmation codes
- **Password Reset**: Reset forgotten passwords with email verification
- **Automatic Token Management**: Amplify handles token refresh automatically
- **Error Handling**: User-friendly error messages for all authentication scenarios

## Configuration

### 1. Environment Setup

Update your environment files with your Cognito configuration:

**src/environments/environment.ts** (Development):
```typescript
aws: {
  region: 'us-east-1',
  cognito: {
    userPoolId: 'us-east-1_XXXXXXXXX', // Your User Pool ID
    clientId: 'your-client-id-here',    // Your App Client ID
    domain: 'your-domain.auth.us-east-1.amazoncognito.com', // Your Cognito domain
    redirectSignIn: 'http://localhost:4200/',
    redirectSignOut: 'http://localhost:4200/',
    responseType: 'code'
  }
}
```

**src/environments/environment.prod.ts** (Production):
```typescript
aws: {
  region: 'us-east-1',
  cognito: {
    userPoolId: 'us-east-1_XXXXXXXXX', // Your Production User Pool ID
    clientId: 'your-prod-client-id',    // Your Production App Client ID
    domain: 'your-prod-domain.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://yourdomain.com/',
    redirectSignOut: 'https://yourdomain.com/',
    responseType: 'code'
  }
}
```

### 2. Cognito User Pool Setup

1. **Create a User Pool** in AWS Cognito
2. **Configure Sign-in Options**:
   - Email address
   - Username (optional)
3. **Set Password Policy**:
   - Minimum 8 characters
   - Require uppercase, lowercase, numbers, and special characters
4. **Configure MFA** (optional but recommended)
5. **Create App Client**:
   - Enable "Generate client secret" = NO (for public clients)
   - Enable "Enable username-password auth for admin APIs for authentication (ALLOW_ADMIN_USER_PASSWORD_AUTH)"
   - Enable "Enable SRP (secure remote password) protocol based authentication (ALLOW_USER_SRP_AUTH)"

### 3. App Client Configuration

In your Cognito App Client settings:
- **Allowed OAuth Flows**: Authorization code grant
- **Allowed OAuth Scopes**: email, openid, profile
- **Callback URLs**: 
  - Development: `http://localhost:4200/`
  - Production: `https://yourdomain.com/`
- **Sign out URLs**:
  - Development: `http://localhost:4200/`
  - Production: `https://yourdomain.com/`

## Installation

1. **Install Dependencies**:
```bash
npm install
```

2. **Update Configuration**:
   - Replace placeholder values in environment files with your actual Cognito configuration

3. **Run the Application**:
```bash
npm start
```

## Usage

### Authentication Flow

1. **Registration**:
   - Users fill out the registration form
   - Cognito sends a confirmation email
   - Users enter the confirmation code to activate their account

2. **Sign In**:
   - Users enter email and password
   - Amplify handles authentication and token management
   - Users are redirected to the dashboard upon successful login

3. **Password Reset**:
   - Users request a password reset
   - Cognito sends a reset code via email
   - Users enter the code and set a new password

### Components

- **LoginComponent**: Handles user sign-in
- **RegisterComponent**: Handles user registration and email confirmation
- **ForgotPasswordComponent**: Handles password reset flow
- **AuthService**: Manages all authentication operations
- **AuthGuard**: Protects routes that require authentication

## Security Features

- **Secure Password Requirements**: Enforced by both client and Cognito
- **Email Verification**: Required for account activation
- **Token-based Authentication**: JWT tokens managed by Amplify
- **Automatic Token Refresh**: Handled transparently by Amplify
- **HTTPS Enforcement**: Recommended for production

## Troubleshooting

### Common Issues

1. **"User is not confirmed"**: User needs to confirm their email address
2. **"Invalid verification code"**: Code may have expired or been mistyped
3. **"Password does not meet requirements"**: Ensure password meets Cognito policy
4. **Configuration errors**: Verify all environment variables are correct

### Debug Mode

Enable debug logging by setting the log level in your environment:
```typescript
logging: {
  level: 'debug',
  enableConsoleLogging: true
}
```

## Production Deployment

1. **Update Environment**: Use production Cognito configuration
2. **Enable HTTPS**: Required for Cognito in production
3. **Configure CORS**: Ensure your domain is allowed in Cognito settings
4. **Test Authentication Flow**: Verify all features work in production environment

## Support

For issues related to:
- **Cognito Configuration**: Check AWS Cognito documentation
- **Amplify Integration**: Check AWS Amplify documentation
- **Application Issues**: Check the browser console for error messages
