import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth service to initialize
  if (!authService.isInitialized()) {
    // Wait for initialization to complete
    await new Promise<void>((resolve) => {
      const checkInitialized = () => {
        if (authService.isInitialized()) {
          resolve();
        } else {
          setTimeout(checkInitialized, 100);
        }
      };
      checkInitialized();
    });
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl } 
  });
  
  return false;
};

// Guard for guests only (redirect authenticated users)
export const GuestGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth service to initialize
  if (!authService.isInitialized()) {
    await new Promise<void>((resolve) => {
      const checkInitialized = () => {
        if (authService.isInitialized()) {
          resolve();
        } else {
          setTimeout(checkInitialized, 100);
        }
      };
      checkInitialized();
    });
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated users to dashboard
  router.navigate(['/dashboard']);
  return false;
};

// Role-based guard
export const RoleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Wait for auth service to initialize
    if (!authService.isInitialized()) {
      await new Promise<void>((resolve) => {
        const checkInitialized = () => {
          if (authService.isInitialized()) {
            resolve();
          } else {
            setTimeout(checkInitialized, 100);
          }
        };
        checkInitialized();
      });
    }

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Check if user has required role
    const hasRequiredRole = allowedRoles.some(role => 
      authService.hasPermission(role)
    );

    if (!hasRequiredRole) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};

// Permission-based guard
export const PermissionGuard = (requiredPermission: string): CanActivateFn => {
  return async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Wait for auth service to initialize
    if (!authService.isInitialized()) {
      await new Promise<void>((resolve) => {
        const checkInitialized = () => {
          if (authService.isInitialized()) {
            resolve();
          } else {
            setTimeout(checkInitialized, 100);
          }
        };
        checkInitialized();
      });
    }

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    if (!authService.hasPermission(requiredPermission)) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};