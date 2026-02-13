import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get current user profile
   */
  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/profile`);
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: UpdateUserProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/profile`, profileData);
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(file: File): Observable<{ profilePictureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ profilePictureUrl: string }>(
      `${this.apiUrl}/users/profile/picture`, 
      formData
    );
  }

  /**
   * Delete profile picture
   */
  deleteProfilePicture(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/profile/picture`);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/preferences`);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/preferences`, preferences);
  }

  /**
   * Delete user account
   */
  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/account`);
  }

  /**
   * Export user data
   */
  exportUserData(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users/export`, { 
      responseType: 'blob' 
    });
  }
}