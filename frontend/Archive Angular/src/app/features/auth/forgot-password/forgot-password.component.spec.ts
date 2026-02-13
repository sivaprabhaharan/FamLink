import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@/app/core/services/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'resetPassword',
      'confirmResetPassword'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms with empty values', () => {
    expect(component.resetForm.get('email')?.value).toBe('');
    expect(component.confirmForm.get('confirmationCode')?.value).toBe('');
    expect(component.confirmForm.get('newPassword')?.value).toBe('');
    expect(component.confirmForm.get('confirmNewPassword')?.value).toBe('');
  });

  it('should validate email field', () => {
    const emailControl = component.resetForm.get('email');
    
    expect(emailControl?.valid).toBeFalsy();
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();
    
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password complexity in confirm form', () => {
    const passwordControl = component.confirmForm.get('newPassword');
    
    passwordControl?.setValue('weak');
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();
    
    passwordControl?.setValue('Password123!');
    expect(passwordControl?.errors).toBeNull();
  });

  it('should validate password match in confirm form', () => {
    const form = component.confirmForm;
    
    form.patchValue({
      confirmationCode: '123456',
      newPassword: 'Password123!',
      confirmNewPassword: 'DifferentPassword!'
    });

    expect(form.get('confirmNewPassword')?.errors?.['passwordMismatch']).toBeTruthy();
    
    form.patchValue({
      confirmNewPassword: 'Password123!'
    });

    expect(form.get('confirmNewPassword')?.errors).toBeNull();
  });

  it('should call AuthService.resetPassword on form submission', async () => {
    mockAuthService.resetPassword.and.returnValue(Promise.resolve());
    
    component.resetForm.patchValue({
      email: 'test@example.com'
    });

    await component.onSubmit();

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });

  it('should show confirmation form after successful reset request', async () => {
    mockAuthService.resetPassword.and.returnValue(Promise.resolve());
    
    component.resetForm.patchValue({
      email: 'test@example.com'
    });

    await component.onSubmit();

    expect(component.showConfirmation).toBeTruthy();
    expect(component.userEmail).toBe('test@example.com');
  });

  it('should call AuthService.confirmResetPassword on confirmation submission', async () => {
    mockAuthService.confirmResetPassword.and.returnValue(Promise.resolve());
    component.showConfirmation = true;
    component.userEmail = 'test@example.com';
    
    component.confirmForm.patchValue({
      confirmationCode: '123456',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!'
    });

    await component.onConfirmSubmit();

    expect(mockAuthService.confirmResetPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      confirmationCode: '123456',
      newPassword: 'NewPassword123!'
    });
  });

  it('should navigate to login after successful password reset', async () => {
    mockAuthService.confirmResetPassword.and.returnValue(Promise.resolve());
    component.showConfirmation = true;
    component.userEmail = 'test@example.com';
    
    component.confirmForm.patchValue({
      confirmationCode: '123456',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!'
    });

    spyOn(window, 'alert');
    await component.onConfirmSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should handle reset password errors', async () => {
    const errorMessage = 'User not found';
    mockAuthService.resetPassword.and.returnValue(Promise.reject(new Error(errorMessage)));
    
    component.resetForm.patchValue({
      email: 'test@example.com'
    });

    await component.onSubmit();

    expect(component.errorMessage).toBe(errorMessage);
  });

  it('should handle confirmation errors', async () => {
    const errorMessage = 'Invalid reset code';
    mockAuthService.confirmResetPassword.and.returnValue(Promise.reject(new Error(errorMessage)));
    component.showConfirmation = true;
    component.userEmail = 'test@example.com';
    
    component.confirmForm.patchValue({
      confirmationCode: '123456',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!'
    });

    await component.onConfirmSubmit();

    expect(component.confirmationError).toBe(errorMessage);
  });

  it('should resend reset code', async () => {
    mockAuthService.resetPassword.and.returnValue(Promise.resolve());
    component.userEmail = 'test@example.com';
    
    spyOn(window, 'alert');
    await component.resendCode();

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });
});