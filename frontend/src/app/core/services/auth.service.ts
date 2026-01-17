import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  signIn, 
  signOut, 
  signUp, 
  confirmSignUp, 
  getCurrentUser, 
  fetchAuthSession,
  AuthUser,
  SignInInput,
  SignUpInput,
  ConfirmSignUpInput,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  ResetPasswordInput,
  ConfirmResetPasswordInput
} from 'aws-amplify/auth';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ConfirmSignUpRequest {
  email: string;
  confirmationCode: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private isInitializedSignal = signal<boolean>(false);
  private registrationUsernameSignal = signal<string | null>(null); // Store username for confirmation

  // Computed signals
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  currentUser = computed(() => this.currentUserSignal());
  isLoading = computed(() => this.isLoadingSignal());
  isInitialized = computed(() => this.isInitializedSignal());

  // Observable streams for compatibility
  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private router: Router) {
    this.syncSignalsWithObservables();
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  async initializeAuth(): Promise<void> {
    this.isLoadingSignal.set(true);
    
    try {
      const user = await getCurrentUser();
      if (user) {
        const userProfile = this.mapAuthUserToUser(user);
        this.setCurrentUser(userProfile);
      }
    } catch (error) {
      // User is not authenticated
      this.setCurrentUser(null);
    } finally {
      this.isLoadingSignal.set(false);
      this.isInitializedSignal.set(true);
    }
  }

  /**
   * Sign in with email and password
   */
  async login(credentials: LoginRequest): Promise<void> {
    this.isLoadingSignal.set(true);
    
    try {
      const signInInput: SignInInput = {
        username: credentials.email,
        password: credentials.password
      };

      const result = await signIn(signInInput);
      
      if (result.isSignedIn) {
        const user = await getCurrentUser();
        const userProfile = this.mapAuthUserToUser(user);
        this.setCurrentUser(userProfile);
        await this.router.navigate(['/dashboard']);
      } else {
        throw new Error('Sign in incomplete');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error));
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Sign up new user
   */
  async register(userData: RegisterRequest): Promise<{ isSignUpComplete: boolean; nextStep?: any }> {
    this.isLoadingSignal.set(true);
    
    try {
      // Generate a unique username since email is used as alias
      const username = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Build user attributes - only include phone if it's provided and properly formatted
      const userAttributes: Record<string, string> = {
        email: userData.email,
        given_name: userData.firstName || '',
        family_name: userData.lastName || ''
      };

      // Only add phone number if provided and properly formatted
      if (userData.phoneNumber && userData.phoneNumber.trim()) {
        // Ensure phone number starts with + and country code
        let phoneNumber = userData.phoneNumber.trim();
        if (!phoneNumber.startsWith('+')) {
          // If no country code, assume US (+1)
          phoneNumber = '+1' + phoneNumber.replace(/\D/g, '');
        }
        userAttributes['phone_number'] = phoneNumber; // Use bracket notation for index signature
      }
      
      const signUpInput: SignUpInput = {
        username: username, // Use generated username instead of email
        password: userData.password,
        options: {
          userAttributes: userAttributes
        }
      };

      const result = await signUp(signUpInput);
      
      // Store the username for confirmation step
      this.registrationUsernameSignal.set(username);
      
      return {
        isSignUpComplete: result.isSignUpComplete,
        nextStep: result.nextStep
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error));
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Confirm sign up with verification code
   */
  async confirmSignUp(data: ConfirmSignUpRequest): Promise<void> {
    this.isLoadingSignal.set(true);
    
    try {
      const username = this.registrationUsernameSignal();
      if (!username) {
        throw new Error('No registration session found. Please register again.');
      }

      const confirmInput: ConfirmSignUpInput = {
        username: username, // Use stored username, not email
        confirmationCode: data.confirmationCode
      };

      await confirmSignUp(confirmInput);
      
      // Clear the stored username after successful confirmation
      this.registrationUsernameSignal.set(null);
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      throw new Error(this.getErrorMessage(error));
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Resend confirmation code
   */
  async resendConfirmationCode(email: string): Promise<void> {
    try {
      const username = this.registrationUsernameSignal();
      if (!username) {
        throw new Error('No registration session found. Please register again.');
      }
      
      await resendSignUpCode({ username: username });
    } catch (error: any) {
      console.error('Resend confirmation code error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Sign out user
   */
  async logout(): Promise<void> {
    this.isLoadingSignal.set(true);
    
    try {
      await signOut();
      this.setCurrentUser(null);
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      this.setCurrentUser(null);
      await this.router.navigate(['/auth/login']);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const resetInput: ResetPasswordInput = {
        username: data.email // For password reset, we can use email directly
      };
      await resetPassword(resetInput);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Confirm reset password with code
   */
  async confirmResetPassword(data: ConfirmResetPasswordRequest): Promise<void> {
    try {
      const confirmInput: ConfirmResetPasswordInput = {
        username: data.email, // For password reset, we can use email directly
        confirmationCode: data.confirmationCode,
        newPassword: data.newPassword
      };
      await confirmResetPassword(confirmInput);
    } catch (error: any) {
      console.error('Confirm reset password error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission (placeholder for future implementation)
   */
  hasPermission(permission: string): boolean {
    // Implement role-based access control here
    // You can check user groups or custom attributes
    return true;
  }

  /**
   * Refresh user data
   */
  async refreshUser(): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (user) {
        const userProfile = this.mapAuthUserToUser(user);
        this.setCurrentUser(userProfile);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      this.setCurrentUser(null);
    }
  }

  // Private methods

  private syncSignalsWithObservables(): void {
    // Update BehaviorSubjects when signals change
    setInterval(() => {
      this.isAuthenticated$.next(this.isAuthenticated());
      this.currentUser$.next(this.currentUser());
    }, 100);
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
  }

  private mapAuthUserToUser(authUser: AuthUser): User {
    return {
      id: authUser.userId,
      email: authUser.signInDetails?.loginId || '',
      firstName: '', // You'll need to get this from user attributes
      lastName: '',  // You'll need to get this from user attributes
      isEmailVerified: true, // Cognito users are email verified after confirmation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getErrorMessage(error: any): string {
    if (error.name === 'UserNotConfirmedException') {
      return 'Please check your email and confirm your account before signing in.';
    }
    if (error.name === 'NotAuthorizedException') {
      return 'Invalid email or password.';
    }
    if (error.name === 'UserNotFoundException') {
      return 'No account found with this email address.';
    }
    if (error.name === 'UsernameExistsException') {
      return 'An account with this email already exists.';
    }
    if (error.name === 'InvalidPasswordException') {
      return 'Password does not meet requirements.';
    }
    if (error.name === 'CodeMismatchException') {
      return 'Invalid verification code.';
    }
    if (error.name === 'ExpiredCodeException') {
      return 'Verification code has expired. Please request a new one.';
    }
    
    return error.message || 'An unexpected error occurred.';
  }
}