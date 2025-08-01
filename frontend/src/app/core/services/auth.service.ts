import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'famlink-access-token';
  private readonly REFRESH_TOKEN_KEY = 'famlink-refresh-token';
  private readonly USER_KEY = 'famlink-user';

  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // Computed signals
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  currentUser = computed(() => this.currentUserSignal());
  isLoading = computed(() => this.isLoadingSignal());

  // Observable versions for compatibility
  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Sync signals with BehaviorSubjects
    this.syncSignalsWithObservables();
  }

  /**
   * Initialize authentication state from stored tokens
   */
  initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.setCurrentUser(user);
      this.setupTokenRefresh();
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    // For development, use placeholder authentication
    if (environment.production) {
      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
        .pipe(
          tap(response => this.handleAuthSuccess(response)),
          catchError(error => this.handleAuthError(error)),
          tap(() => this.isLoadingSignal.set(false))
        );
    } else {
      // Placeholder authentication for development
      return this.mockLogin(credentials);
    }
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    if (environment.production) {
      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
        .pipe(
          tap(response => this.handleAuthSuccess(response)),
          catchError(error => this.handleAuthError(error)),
          tap(() => this.isLoadingSignal.set(false))
        );
    } else {
      // Placeholder registration for development
      return this.mockRegister(userData);
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.isLoadingSignal.set(true);

    // Call logout endpoint if in production
    if (environment.production) {
      const refreshToken = this.getStoredRefreshToken();
      if (refreshToken) {
        this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken })
          .subscribe({
            complete: () => this.completeLogout()
          });
      } else {
        this.completeLogout();
      }
    } else {
      this.completeLogout();
    }
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (environment.production) {
      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
        .pipe(
          tap(response => this.handleAuthSuccess(response)),
          catchError(error => {
            this.logout();
            return throwError(() => error);
          })
        );
    } else {
      // Mock refresh for development
      return of({
        user: this.currentUserSignal()!,
        accessToken: 'mock-refreshed-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      });
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Check if user has specific role or permission
   */
  hasPermission(permission: string): boolean {
    // Implement role-based access control here
    return true; // Placeholder
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    this.isLoadingSignal.set(true);

    if (environment.production) {
      return this.http.put<User>(`${environment.apiUrl}/users/profile`, userData)
        .pipe(
          tap(user => {
            this.setCurrentUser(user);
            this.storeUser(user);
          }),
          catchError(error => this.handleAuthError(error)),
          tap(() => this.isLoadingSignal.set(false))
        );
    } else {
      // Mock update for development
      const currentUser = this.currentUserSignal();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        this.setCurrentUser(updatedUser);
        this.storeUser(updatedUser);
        this.isLoadingSignal.set(false);
        return of(updatedUser);
      }
      return throwError(() => new Error('No current user'));
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

  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    // Simulate API delay
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        if (credentials.email === 'demo@famlink.com' && credentials.password === 'demo123') {
          const mockResponse: AuthResponse = {
            user: {
              id: '1',
              email: credentials.email,
              firstName: 'Demo',
              lastName: 'User',
              profilePictureUrl: 'https://via.placeholder.com/150',
              phoneNumber: '+1234567890',
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          };
          this.handleAuthSuccess(mockResponse);
          this.isLoadingSignal.set(false);
          observer.next(mockResponse);
          observer.complete();
        } else {
          this.isLoadingSignal.set(false);
          observer.error(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  private mockRegister(userData: RegisterRequest): Observable<AuthResponse> {
    // Simulate API delay
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        };
        this.handleAuthSuccess(mockResponse);
        this.isLoadingSignal.set(false);
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storeToken(response.accessToken);
    this.storeRefreshToken(response.refreshToken);
    this.storeUser(response.user);
    this.setCurrentUser(response.user);
    this.setupTokenRefresh();
  }

  private handleAuthError(error: any): Observable<never> {
    console.error('Authentication error:', error);
    this.clearAuthData();
    return throwError(() => error);
  }

  private completeLogout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
    this.isLoadingSignal.set(false);
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
  }

  private storeToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private storeRefreshToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private storeUser(user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (typeof localStorage !== 'undefined') {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  private clearAuthData(): void {
    this.setCurrentUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private setupTokenRefresh(): void {
    // Set up automatic token refresh 5 minutes before expiration
    const token = this.getStoredToken();
    if (token && !this.isTokenExpired(token)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const refreshTime = expirationTime - (5 * 60 * 1000); // 5 minutes before
        const timeUntilRefresh = refreshTime - Date.now();

        if (timeUntilRefresh > 0) {
          setTimeout(() => {
            this.refreshToken().subscribe();
          }, timeUntilRefresh);
        }
      } catch (error) {
        console.error('Error setting up token refresh:', error);
      }
    }
  }
}