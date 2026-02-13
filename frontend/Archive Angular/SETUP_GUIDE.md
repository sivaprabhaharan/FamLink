# FamLink AWS Cognito Setup Guide

## Quick Start

I've completely refactored your authentication system to use AWS Amplify with Cognito. Here's what you need to do to get it working:

## 1. Update Your Environment Configuration

Replace the placeholder values in your environment files with your actual Cognito configuration:

### `src/environments/environment.ts` (Development)
```typescript
aws: {
  region: 'us-east-1', // Your AWS region
  cognito: {
    userPoolId: 'us-east-1_XXXXXXXXX', // Replace with your actual User Pool ID
    clientId: 'your-actual-client-id',  // Replace with your actual App Client ID
    domain: 'your-domain.auth.us-east-1.amazoncognito.com', // Replace with your domain (no https://)
    redirectSignIn: 'http://localhost:4200/',
    redirectSignOut: 'http://localhost:4200/',
    responseType: 'code'
  }
}
```

### `src/environments/environment.prod.ts` (Production)
```typescript
aws: {
  region: 'us-east-1',
  cognito: {
    userPoolId: 'us-east-1_XXXXXXXXX', // Your production User Pool ID
    clientId: 'your-prod-client-id',    // Your production App Client ID
    domain: 'your-prod-domain.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://yourdomain.com/',
    redirectSignOut: 'https://yourdomain.com/',
    responseType: 'code'
  }
}
```

## 2. AWS Cognito Configuration

### User Pool Settings:
1. **Sign-in options**: 
   - ✅ Email address (as alias)
   - ❌ Username (disable if using email alias)
2. **Password policy**: 
   - Minimum 8 characters
   - Require uppercase, lowercase, numbers, special characters
3. **MFA**: Optional (recommended for production)
4. **Email verification**: Required (should be enabled by default)

### App Client Settings:
1. **Authentication flows**:
   - ✅ ALLOW_USER_SRP_AUTH
   - ✅ ALLOW_USER_PASSWORD_AUTH (for admin APIs)
2. **OAuth 2.0 settings**:
   - **Allowed OAuth flows**: Authorization code grant
   - **Allowed OAuth scopes**: email, openid, profile
   - **Callback URLs**: `http://localhost:4200/` (dev), `https://yourdomain.com/` (prod)
   - **Sign out URLs**: Same as callback URLs

## 3. What's New

### ✅ Complete Authentication Flow
- **Sign Up**: Users register and receive email confirmation
- **Email Verification**: Required before users can sign in
- **Sign In**: Email/password authentication
- **Password Reset**: Forgot password with email verification
- **Auto Token Management**: Amplify handles token refresh automatically

### ✅ New Components
- **Enhanced Login**: Better UX with proper error handling
- **Registration with Confirmation**: Two-step registration process
- **Forgot Password**: Complete password reset flow
- **Improved Error Messages**: User-friendly error messages

### ✅ Security Improvements
- **Proper Password Validation**: Client-side and server-side validation
- **Email Verification**: Required for account activation
- **Secure Token Storage**: Managed by Amplify
- **CSRF Protection**: Built into Amplify

## 4. Testing the Setup

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Test Registration**:
   - Go to `/auth/register`
   - Fill out the form with a valid email
   - Check your email for confirmation code
   - Enter the code to activate your account

3. **Test Sign In**:
   - Go to `/auth/login`
   - Use your registered email and password
   - Should redirect to dashboard on success

4. **Test Password Reset**:
   - Go to `/auth/forgot-password`
   - Enter your email
   - Check email for reset code
   - Enter code and new password

## 5. Removed Dependencies

I've cleaned up the project by removing:
- ❌ Azure AD/MSAL dependencies
- ❌ angular-auth-oidc-client
- ❌ @heroicons/react (not needed for Angular)
- ❌ Mixed authentication systems

## 6. Key Files Modified

- `src/app/core/services/auth.service.ts` - Complete rewrite using Amplify
- `src/app/features/auth/login/login.component.ts` - Enhanced login component
- `src/app/features/auth/register/register.component.ts` - New registration with confirmation
- `src/app/features/auth/forgot-password/forgot-password.component.ts` - New password reset
- `src/app/auth/amplify.config.ts` - Amplify configuration
- `src/main.ts` - Initialize Amplify on app start
- `package.json` - Updated dependencies

## 7. Next Steps

1. **Update your Cognito configuration** in the environment files
2. **Test the authentication flow** thoroughly
3. **Configure your Cognito User Pool** according to the settings above
4. **Deploy and test** in your staging environment

## 8. Troubleshooting

### Common Issues:
- **"Username cannot be of email format"**: Your User Pool is configured for email aliases - this is now handled automatically
- **"Configuration error"**: Check your environment variables
- **"User not confirmed"**: User needs to confirm email
- **"Invalid verification code"**: Code expired or mistyped
- **CORS errors**: Check your Cognito domain configuration
- **"No registration session found"**: User needs to register again if confirmation fails

### Debug Mode:
Set `logging.level: 'debug'` in your environment to see detailed logs.

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Cognito configuration matches the requirements
3. Test with a fresh email address for registration
4. Ensure your email provider isn't blocking AWS emails

The authentication system is now production-ready with proper error handling, security, and user experience!