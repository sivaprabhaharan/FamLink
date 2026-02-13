import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '@/app/core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'register',
      'confirmSignUp',
      'resendConfirmationCode'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.registerForm.get('agreeToTerms')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    
    expect(form.valid).toBeFalsy();

    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeToTerms: true
    });

    expect(form.valid).toBeTruthy();
  });

  it('should validate password match', () => {
    const form = component.registerForm;
    
    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
      agreeToTerms: true
    });

    expect(form.get('confirmPassword')?.errors?.['passwordMismatch']).toBeTruthy();
  });

  it('should validate password complexity', () => {
    const passwordControl = component.registerForm.get('password');
    
    passwordControl?.setValue('weak');
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();
    
    passwordControl?.setValue('Password123!');
    expect(passwordControl?.errors).toBeNull();
  });

  it('should call AuthService.register on form submission', async () => {
    mockAuthService.register.and.returnValue(Promise.resolve({ 
      isSignUpComplete: false,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP' }
    }));
    
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeToTerms: true
    });

    await component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe'
    });
  });

  it('should show confirmation form when registration requires confirmation', async () => {
    mockAuthService.register.and.returnValue(Promise.resolve({ 
      isSignUpComplete: false,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP' }
    }));
    
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeToTerms: true
    });

    await component.onSubmit();

    expect(component.showConfirmation).toBeTruthy();
    expect(component.userEmail).toBe('john@example.com');
  });

  it('should call AuthService.confirmSignUp on confirmation submission', async () => {
    mockAuthService.confirmSignUp.and.returnValue(Promise.resolve());
    component.showConfirmation = true;
    component.userEmail = 'john@example.com';
    
    component.confirmationForm.patchValue({
      confirmationCode: '123456'
    });

    await component.onConfirmSubmit();

    expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith({
      email: 'john@example.com',
      confirmationCode: '123456'
    });
  });

  it('should navigate to login after successful confirmation', async () => {
    mockAuthService.confirmSignUp.and.returnValue(Promise.resolve());
    component.showConfirmation = true;
    component.userEmail = 'john@example.com';
    
    component.confirmationForm.patchValue({
      confirmationCode: '123456'
    });

    spyOn(window, 'alert');
    await component.onConfirmSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should handle registration errors', async () => {
    const errorMessage = 'Email already exists';
    mockAuthService.register.and.returnValue(Promise.reject(new Error(errorMessage)));
    
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeToTerms: true
    });

    await component.onSubmit();

    expect(component.errorMessage).toBe(errorMessage);
  });

  it('should handle confirmation errors', async () => {
    const errorMessage = 'Invalid confirmation code';
    mockAuthService.confirmSignUp.and.returnValue(Promise.reject(new Error(errorMessage)));
    component.showConfirmation = true;
    component.userEmail = 'john@example.com';
    
    component.confirmationForm.patchValue({
      confirmationCode: '123456'
    });

    await component.onConfirmSubmit();

    expect(component.confirmationError).toBe(errorMessage);
  });

  it('should resend confirmation code', async () => {
    mockAuthService.resendConfirmationCode.and.returnValue(Promise.resolve());
    component.userEmail = 'john@example.com';
    
    spyOn(window, 'alert');
    await component.resendCode();

    expect(mockAuthService.resendConfirmationCode).toHaveBeenCalledWith('john@example.com');
  });
});