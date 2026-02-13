import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { ProfileComponent } from './profile.component';
import { AuthService, User } from '@/app/core/services/auth.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isEmailVerified: true,
    createdAt: '2023-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'refreshUser',
      'logout'
    ]);
    // Mock the currentUser signal properly
    Object.defineProperty(mockAuthService, 'currentUser', {
      value: signal(mockUser),
      writable: false
    });
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    component.ngOnInit();

    expect(component.profileForm.get('firstName')?.value).toBe('John');
    expect(component.profileForm.get('lastName')?.value).toBe('Doe');
    expect(component.profileForm.get('email')?.value).toBe('test@example.com');
  });

  it('should validate required fields', () => {
    const firstNameControl = component.profileForm.get('firstName');
    const lastNameControl = component.profileForm.get('lastName');

    firstNameControl?.setValue('');
    lastNameControl?.setValue('');

    expect(firstNameControl?.valid).toBeFalsy();
    expect(lastNameControl?.valid).toBeFalsy();

    firstNameControl?.setValue('John');
    lastNameControl?.setValue('Doe');

    expect(firstNameControl?.valid).toBeTruthy();
    expect(lastNameControl?.valid).toBeTruthy();
  });

  it('should call AuthService.refreshUser on refresh', async () => {
    mockAuthService.refreshUser.and.returnValue(Promise.resolve());

    await component.refreshProfile();

    expect(mockAuthService.refreshUser).toHaveBeenCalled();
  });

  it('should call AuthService.logout on sign out', async () => {
    mockAuthService.logout.and.returnValue(Promise.resolve());

    await component.signOut();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should navigate to forgot password on change password', () => {
    component.changePassword();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
  });
});