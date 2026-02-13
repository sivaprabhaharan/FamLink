import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your FamLink account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Already have an account?
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </a>
          </p>
        </div>

        <!-- Registration Form -->
        <form *ngIf="!showConfirmation" [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  [class.border-red-500]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                  placeholder="First name"
                />
                <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched" class="text-red-500 text-xs mt-1">
                  <span *ngIf="registerForm.get('firstName')?.errors?.['required']">First name is required</span>
                </div>
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  [class.border-red-500]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                  placeholder="Last name"
                />
                <div *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched" class="text-red-500 text-xs mt-1">
                  <span *ngIf="registerForm.get('lastName')?.errors?.['required']">Last name is required</span>
                </div>
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                placeholder="Email address"
              />
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>

            <!-- Temporarily comment out phone number field -->
            <!--
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input
                id="phoneNumber"
                type="tel"
                formControlName="phoneNumber"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-500]="registerForm.get('phoneNumber')?.invalid && registerForm.get('phoneNumber')?.touched"
                placeholder="+1 (555) 123-4567 (optional)"
              />
              <div *ngIf="registerForm.get('phoneNumber')?.invalid && registerForm.get('phoneNumber')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('phoneNumber')?.errors?.['pattern']">Please enter a valid phone number with country code (e.g., +1234567890)</span>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Leave empty to receive verification codes via email only
              </p>
            </div>
            -->

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                placeholder="Password"
              />
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
                <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Password must contain uppercase, lowercase, number, and special character</span>
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                [class.border-red-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                placeholder="Confirm password"
              />
              <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
              </div>
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              formControlName="agreeToTerms"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="agreeToTerms" class="ml-2 block text-sm text-gray-900">
              I agree to the 
              <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
              and 
              <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
            </label>
          </div>
          <div *ngIf="registerForm.get('agreeToTerms')?.invalid && registerForm.get('agreeToTerms')?.touched" class="text-red-500 text-xs">
            <span *ngIf="registerForm.get('agreeToTerms')?.errors?.['required']">You must agree to the terms and conditions</span>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
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
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
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
              {{ isLoading ? 'Creating account...' : 'Create account' }}
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
              We've sent a confirmation code to <strong>{{ userEmail }}</strong>
            </p>
          </div>

          <form [formGroup]="confirmationForm" (ngSubmit)="onConfirmSubmit()" class="space-y-4">
            <div>
              <label for="confirmationCode" class="block text-sm font-medium text-gray-700">Confirmation Code</label>
              <input
                id="confirmationCode"
                type="text"
                formControlName="confirmationCode"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-lg tracking-widest"
                [class.border-red-500]="confirmationForm.get('confirmationCode')?.invalid && confirmationForm.get('confirmationCode')?.touched"
                placeholder="Enter 6-digit code"
                maxlength="6"
              />
              <div *ngIf="confirmationForm.get('confirmationCode')?.invalid && confirmationForm.get('confirmationCode')?.touched" class="text-red-500 text-xs mt-1">
                <span *ngIf="confirmationForm.get('confirmationCode')?.errors?.['required']">Confirmation code is required</span>
                <span *ngIf="confirmationForm.get('confirmationCode')?.errors?.['pattern']">Please enter a valid 6-digit code</span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="confirmationForm.invalid || isConfirming"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ isConfirming ? 'Confirming...' : 'Confirm Account' }}
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    // phoneNumber: ['', [Validators.pattern(/^\+[1-9]\d{1,14}$/)]],  // Temporarily removed
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]]
  }, { validators: this.passwordMatchValidator });

  confirmationForm: FormGroup = this.fb.group({
    confirmationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  isLoading = false;
  isConfirming = false;
  isResending = false;
  errorMessage = '';
  confirmationError = '';
  showConfirmation = false;
  userEmail = '';

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
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
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const formValue = this.registerForm.value;
      const userData = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName
        // phoneNumber: undefined // Temporarily removed
      };

      const result = await this.authService.register(userData);
      
      if (!result.isSignUpComplete) {
        // Need email confirmation
        this.userEmail = formValue.email;
        this.showConfirmation = true;
      } else {
        // Registration complete, redirect to login
        await this.router.navigate(['/auth/login']);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async onConfirmSubmit() {
    if (this.confirmationForm.invalid) return;

    this.isConfirming = true;
    this.confirmationError = '';

    try {
      const confirmationData = {
        email: this.userEmail, // We still pass email, but service will use stored username
        confirmationCode: this.confirmationForm.get('confirmationCode')?.value
      };

      await this.authService.confirmSignUp(confirmationData);
      
      // Show success message and redirect to login
      alert('Account confirmed successfully! You can now sign in.');
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Confirmation error:', error);
      this.confirmationError = error.message || 'Confirmation failed. Please try again.';
    } finally {
      this.isConfirming = false;
    }
  }

  async resendCode() {
    this.isResending = true;
    this.confirmationError = '';

    try {
      await this.authService.resendConfirmationCode(this.userEmail); // Service will use stored username
      alert('Confirmation code sent! Please check your email.');
    } catch (error: any) {
      console.error('Resend error:', error);
      this.confirmationError = error.message || 'Failed to resend confirmation code.';
    } finally {
      this.isResending = false;
    }
  }
}