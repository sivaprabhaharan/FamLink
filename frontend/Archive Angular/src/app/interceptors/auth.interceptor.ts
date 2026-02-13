import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth for certain endpoints
  const skipAuth = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password'
  ].some(endpoint => req.url.includes(endpoint));

  if (skipAuth) {
    return next(req);
  }

  // Get token asynchronously from Amplify
  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      let authReq = req;
      
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
      }
      
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle authentication errors
          if (error.status === 401) {
            // Token expired or invalid, redirect to login
            authService.logout();
            return throwError(() => error);
          }
          
          // Handle other errors
          return throwError(() => error);
        })
      );
    }),
    catchError((error) => {
      // Handle token retrieval errors
      console.error('Error getting access token:', error);
      return next(req);
    })
  );
};