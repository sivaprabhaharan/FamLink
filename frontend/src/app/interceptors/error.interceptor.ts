import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad Request';
            break;
          case 401:
            errorMessage = 'Unauthorized - Please login again';
            authService.logout();
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'Forbidden - You do not have permission';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflict - Resource already exists';
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation failed';
            break;
          case 429:
            errorMessage = 'Too many requests - Please try again later';
            break;
          case 500:
            errorMessage = 'Internal server error - Please try again later';
            break;
          case 502:
            errorMessage = 'Bad gateway - Service temporarily unavailable';
            break;
          case 503:
            errorMessage = 'Service unavailable - Please try again later';
            break;
          case 504:
            errorMessage = 'Gateway timeout - Please try again later';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
        }
      }

      // Log error for debugging
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        method: req.method,
        error: error.error
      });

      // You can add toast notification service here
      // this.toastService.error(errorMessage);

      return throwError(() => ({
        ...error,
        userMessage: errorMessage
      }));
    })
  );
};