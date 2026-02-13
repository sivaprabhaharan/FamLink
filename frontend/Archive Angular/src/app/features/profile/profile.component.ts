import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, User } from '@/app/core/services/auth.service';
import { UserService } from '@/app/core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Profile Information -->
          <div class="lg:col-span-2">
            <!-- Profile Picture Section -->
            <div class="bg-white shadow rounded-lg mb-6">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Profile Picture</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Upload a profile picture to personalize your account
                </p>
              </div>
              
              <div class="p-6">
                <div class="flex items-center space-x-6">
                  <div class="shrink-0">
                    <div class="h-20 w-20 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                      <img 
                        *ngIf="currentUser()?.profilePictureUrl"
                        class="h-20 w-20 object-cover rounded-full"
                        [src]="currentUser()?.profilePictureUrl"
                        [alt]="(currentUser()?.firstName || 'User') + ' profile picture'"
                        (error)="onImageError($event)"
                      />
                      <div *ngIf="!currentUser()?.profilePictureUrl" class="text-gray-400">
                        <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <label for="profile-picture" class="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ isUploadingPicture ? 'Uploading...' : 'Change Picture' }}
                      </label>
                      <input
                        id="profile-picture"
                        type="file"
                        class="hidden"
                        accept="image/jpeg,image/png,image/gif"
                        (change)="onFileSelected($event)"
                        [disabled]="isUploadingPicture"
                      />
                      <button
                        *ngIf="currentUser()?.profilePictureUrl"
                        type="button"
                        (click)="removeProfilePicture()"
                        [disabled]="isUploadingPicture"
                        class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                    <p class="mt-2 text-xs text-gray-500">
                      JPG, PNG or GIF. Max file size 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Personal Information</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Update your personal details and contact information
                </p>
              </div>

              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="p-6 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      formControlName="firstName"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      [class.border-red-500]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                    />
                    <div *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched" class="text-red-500 text-xs mt-1">
                      <span *ngIf="profileForm.get('firstName')?.errors?.['required']">First name is required</span>
                    </div>
                  </div>

                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      formControlName="lastName"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      [class.border-red-500]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                    />
                    <div *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched" class="text-red-500 text-xs mt-1">
                      <span *ngIf="profileForm.get('lastName')?.errors?.['required']">Last name is required</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    readonly
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Email address cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div>
                  <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    formControlName="phoneNumber"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    [class.border-red-500]="profileForm.get('phoneNumber')?.invalid && profileForm.get('phoneNumber')?.touched"
                    placeholder="+1 (555) 123-4567"
                  />
                  <div *ngIf="profileForm.get('phoneNumber')?.invalid && profileForm.get('phoneNumber')?.touched" class="text-red-500 text-xs mt-1">
                    <span *ngIf="profileForm.get('phoneNumber')?.errors?.['pattern']">Please enter a valid phone number with country code</span>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || isUpdatingProfile"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg *ngIf="isUpdatingProfile" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
                  </button>
                </div>

                <div *ngIf="profileUpdateMessage" class="rounded-md p-4" [class]="profileUpdateMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg *ngIf="profileUpdateMessage.type === 'success'" class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <svg *ngIf="profileUpdateMessage.type === 'error'" class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium" [class]="profileUpdateMessage.type === 'success' ? 'text-green-800' : 'text-red-800'">
                        {{ profileUpdateMessage.message }}
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="space-y-6">
            <!-- Account Security -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Account Security</h3>
              </div>
              <div class="p-6 space-y-4">
                <button
                  type="button"
                  (click)="changePassword()"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>

                <button
                  type="button"
                  (click)="refreshProfile()"
                  [disabled]="isRefreshing"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" [class.animate-spin]="isRefreshing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ isRefreshing ? 'Refreshing...' : 'Refresh Profile' }}
                </button>
              </div>
            </div>

            <!-- Account Information -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Account Information</h3>
              </div>
              <div class="p-6 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Account Status</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Active
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Email Verified</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                        [class]="currentUser()?.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    <svg class="-ml-0.5 mr-1.5 h-2 w-2" [class]="currentUser()?.isEmailVerified ? 'text-green-400' : 'text-yellow-400'" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    {{ currentUser()?.isEmailVerified ? 'Verified' : 'Pending' }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Member Since</span>
                  <span class="text-sm text-gray-900">
                    {{ currentUser()?.createdAt | date:'MMM d, y' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="bg-white shadow rounded-lg border-red-200 border">
              <div class="px-6 py-4 border-b border-red-200">
                <h3 class="text-lg font-medium text-red-900">Danger Zone</h3>
              </div>
              <div class="p-6">
                <button
                  type="button"
                  (click)="signOut()"
                  [disabled]="isSigningOut"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {{ isSigningOut ? 'Signing Out...' : 'Sign Out' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^\+[1-9]\d{1,14}$/)]]
  });

  currentUser = this.authService.currentUser;
  isUpdatingProfile = false;
  isRefreshing = false;
  isSigningOut = false;
  isUploadingPicture = false;
  profileUpdateMessage: { type: 'success' | 'error', message: string } | null = null;
  selectedFile: File | null = null;

  ngOnInit() {
    // Initialize form with current user data
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phoneNumber: user.phoneNumber || ''
      });
    }
  }

  async onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile = true;
    this.profileUpdateMessage = null;

    try {
      const formValue = this.profileForm.value;
      const profileData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber || undefined
      };
      
      // Update profile via backend API
      const updatedUser = await this.authService.updateProfile(profileData);
      
      // Update form with the response data
      this.profileForm.patchValue({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || ''
      });
      
      this.profileUpdateMessage = {
        type: 'success',
        message: 'Profile updated successfully!'
      };

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.profileUpdateMessage = null;
      }, 3000);
    } catch (error: any) {
      console.error('Profile update error:', error);
      this.profileUpdateMessage = {
        type: 'error',
        message: error.message || 'Failed to update profile. Please try again.'
      };
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  changePassword() {
    // Navigate to forgot password page which handles password changes
    this.router.navigate(['/auth/forgot-password']);
  }

  async refreshProfile() {
    this.isRefreshing = true;
    this.profileUpdateMessage = null;

    try {
      await this.authService.refreshUser();
      
      // Update form with refreshed data
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          phoneNumber: user.phoneNumber || ''
        });
      }

      this.profileUpdateMessage = {
        type: 'success',
        message: 'Profile refreshed successfully!'
      };

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.profileUpdateMessage = null;
      }, 3000);
    } catch (error: any) {
      console.error('Profile refresh error:', error);
      this.profileUpdateMessage = {
        type: 'error',
        message: error.message || 'Failed to refresh profile. Please try again.'
      };
    } finally {
      this.isRefreshing = false;
    }
  }

  async signOut() {
    this.isSigningOut = true;

    try {
      await this.authService.logout();
      // Navigation is handled in AuthService
    } catch (error: any) {
      console.error('Sign out error:', error);
      this.profileUpdateMessage = {
        type: 'error',
        message: error.message || 'Failed to sign out. Please try again.'
      };
    } finally {
      this.isSigningOut = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.profileUpdateMessage = {
          type: 'error',
          message: 'File size must be less than 5MB.'
        };
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.profileUpdateMessage = {
          type: 'error',
          message: 'Please select a valid image file (JPG, PNG, or GIF).'
        };
        return;
      }
      
      this.selectedFile = file;
      this.uploadProfilePicture();
    }
  }

  async uploadProfilePicture(): Promise<void> {
    if (!this.selectedFile) return;

    this.isUploadingPicture = true;
    this.profileUpdateMessage = null;

    try {
      const response = await firstValueFrom(
        this.userService.uploadProfilePicture(this.selectedFile)
      );
      
      // Refresh user profile to get updated picture URL
      await this.authService.refreshUser();
      
      this.profileUpdateMessage = {
        type: 'success',
        message: 'Profile picture updated successfully!'
      };

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.profileUpdateMessage = null;
      }, 3000);
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      this.profileUpdateMessage = {
        type: 'error',
        message: error.message || 'Failed to upload profile picture. Please try again.'
      };
    } finally {
      this.isUploadingPicture = false;
      this.selectedFile = null;
    }
  }

  async removeProfilePicture(): Promise<void> {
    this.isUploadingPicture = true;
    this.profileUpdateMessage = null;

    try {
      await firstValueFrom(
        this.userService.deleteProfilePicture()
      );
      
      // Refresh user profile to remove picture URL
      await this.authService.refreshUser();
      
      this.profileUpdateMessage = {
        type: 'success',
        message: 'Profile picture removed successfully!'
      };

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.profileUpdateMessage = null;
      }, 3000);
    } catch (error: any) {
      console.error('Profile picture removal error:', error);
      this.profileUpdateMessage = {
        type: 'error',
        message: error.message || 'Failed to remove profile picture. Please try again.'
      };
    } finally {
      this.isUploadingPicture = false;
    }
  }

  onImageError(event: Event): void {
    // Hide the image if it fails to load
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
