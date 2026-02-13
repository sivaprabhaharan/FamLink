import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Remember your password?
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </a>
          </p>
        </div>

        <!-- Reset Password Form -->
        <form *ngIf="!showConfirmation" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              [class.border-red-500]="resetForm.get('email')?.invalid && resetForm.get('email')?.touched"
              placeholder="Enter your email address"
            />
            <div *ngIf="resetForm.get('email')?.invalid && resetForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
              <span *ngIf="resetForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="resetForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="resetForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  *ngIf="!isLoading"
                  class="h-5 w-5 text-primary-500 group-hover:text-primary-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <svg
                  *ngIf="isLoading"
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ isLoading ? 'Sending...' : 'Send reset code' }}
            </button>
          </div>

          <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ errorMessage }}
                </h3>
              </div>
            </div>
          </div>
        </form>

        <!-- Confirmation Form -->
        <div *ngIf="showConfirmation" class="mt-8 space-y-6">
          <div class="text-center">
            <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
            <p class="mt-2 text-sm text-gray-600">
              We've sent a password reset code to <strong>{{ userEmail }}</strong>
            </p>
          </div>

          <form [formGroup]="confirmForm" (ngSubmit)="onConfirmSubmit()" class="space-y-4">
            <div>
              <label for="confirmationCode" class="block text-sm font-medium text-gray-700">Reset Code</label>
              <input
                id="confirmationCode"
                type="text"
                formControlName="confirmationCode"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-lg tracking-widest"
                [class.border-red-500]="confirmForm.get('confirmationCode')?.invalid && confirmForm.get('confirmationCode')?.touched"
                placeholder="Enter reset code"
                maxlength="6"
              />
              <div *ngIf="confirmForm.get('confirmationCode')?.invalid && confirmForm.get('confirmationCode')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="confirmForm.get('confirmationCode')?.errors?.['required']">Reset code is required</span>
              </div>
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="newPassword"
                type="password"
                formControlName="newPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-500]="confirmForm.get('newPassword')?.invalid && confirmForm.get('newPassword')?.touched"
                placeholder="Enter new password"
              />
              <div *ngIf="confirmForm.get('newPassword')?.invalid && confirmForm.get('newPassword')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="confirmForm.get('newPassword')?.errors?.['required']">New password is required</span>
                <span *ngIf="confirmForm.get('newPassword')?.errors?.['minlength']">Password must be at least 8 characters</span>
                <span *ngIf="confirmForm.get('newPassword')?.errors?.['pattern']">Password must contain uppercase, lowercase, number, and special character</span>
              </div>
            </div>

            <div>
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                formControlName="confirmNewPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-500]="confirmForm.get('confirmNewPassword')?.invalid && confirmForm.get('confirmNewPassword')?.touched"
                placeholder="Confirm new password"
              />
              <div *ngIf="confirmForm.get('confirmNewPassword')?.invalid && confirmForm.get('confirmNewPassword')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="confirmForm.get('confirmNewPassword')?.errors?.['required']">Please confirm your new password</span>
                <span *ngIf="confirmForm.get('confirmNewPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="confirmForm.invalid || isConfirming"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ isConfirming ? 'Resetting...' : 'Reset Password' }}
              </button>
            </div>

            <div class="text-center">
              <button
                type="button"
                (click)="resendCode()"
                [disabled]="isResending"
                class="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400"
              >
                {{ isResending ? 'Sending...' : "Didn't receive the code? Resend" }}
              </button>
            </div>
          </form>

          <div *ngIf="confirmationError" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ confirmationError }}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  confirmForm: FormGroup = this.fb.group({
    confirmationCode: ['', [Validators.required]],
    newPassword: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    confirmNewPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  isConfirming = false;
  isResending = false;
  errorMessage = '';
  confirmationError = '';
  showConfirmation = false;
  userEmail = '';

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmNewPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const email = this.resetForm.get('email')?.value;
      await this.authService.resetPassword({ email });
      
      this.userEmail = email;
      this.showConfirmation = true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      this.errorMessage = error.message || 'Failed to send reset code. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async onConfirmSubmit() {
    if (this.confirmForm.invalid) return;

    this.isConfirming = true;
    this.confirmationError = '';

    try {
      const formValue = this.confirmForm.value;
      const resetData = {
        email: this.userEmail,
        confirmationCode: formValue.confirmationCode,
        newPassword: formValue.newPassword
      };

      await this.authService.confirmResetPassword(resetData);
      
      // Show success message and redirect to login
      alert('Password reset successfully! You can now sign in with your new password.');
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Confirm reset password error:', error);
      this.confirmationError = error.message || 'Failed to reset password. Please try again.';
    } finally {
      this.isConfirming = false;
    }
  }

  async resendCode() {
    this.isResending = true;
    this.confirmationError = '';

    try {
      await this.authService.resetPassword({ email: this.userEmail });
      alert('Reset code sent! Please check your email.');
    } catch (error: any) {
      console.error('Resend error:', error);
      this.confirmationError = error.message || 'Failed to resend reset code.';
    } finally {
      this.isResending = false;
    }
  }
}