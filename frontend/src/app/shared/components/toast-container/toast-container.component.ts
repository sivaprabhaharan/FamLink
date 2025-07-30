import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
        [class]="getToastClasses(toast)"
        [@slideIn]>
        
        <div class="p-4">
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <svg 
                class="h-6 w-6" 
                [class]="getIconClasses(toast)"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor">
                <path 
                  *ngIf="toast.type === 'success'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path 
                  *ngIf="toast.type === 'error'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path 
                  *ngIf="toast.type === 'warning'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                <path 
                  *ngIf="toast.type === 'info'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <!-- Content -->
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium" [class]="getTitleClasses(toast)">
                {{ toast.title }}
              </p>
              <p 
                *ngIf="toast.message" 
                class="mt-1 text-sm" 
                [class]="getMessageClasses(toast)">
                {{ toast.message }}
              </p>
            </div>
            
            <!-- Close button -->
            <div class="ml-4 flex-shrink-0 flex">
              <button
                class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2"
                [class]="getCloseButtonClasses(toast)"
                (click)="removeToast(toast.id)">
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress bar for timed toasts -->
        <div 
          *ngIf="!toast.persistent && toast.duration"
          class="h-1 bg-black bg-opacity-10">
          <div 
            class="h-full transition-all ease-linear"
            [class]="getProgressBarClasses(toast)"
            [style.animation-duration.ms]="toast.duration">
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [
    // You would import animations from @angular/animations
    // For now, we'll use CSS transitions
  ]
})
export class ToastContainerComponent {
  toasts: Toast[] = [];

  addToast(toast: Omit<Toast, 'id'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId(),
      duration: toast.duration || 5000
    };

    this.toasts.push(newToast);

    // Auto-remove toast after duration
    if (!newToast.persistent) {
      setTimeout(() => {
        this.removeToast(newToast.id);
      }, newToast.duration);
    }
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  clearAll(): void {
    this.toasts = [];
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getToastClasses(toast: Toast): string {
    const baseClasses = 'bg-white dark:bg-neutral-800 border-l-4';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} border-green-400`;
      case 'error':
        return `${baseClasses} border-red-400`;
      case 'warning':
        return `${baseClasses} border-yellow-400`;
      case 'info':
        return `${baseClasses} border-blue-400`;
      default:
        return `${baseClasses} border-neutral-400`;
    }
  }

  getIconClasses(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-neutral-400';
    }
  }

  getTitleClasses(toast: Toast): string {
    return 'text-neutral-900 dark:text-neutral-100';
  }

  getMessageClasses(toast: Toast): string {
    return 'text-neutral-500 dark:text-neutral-400';
  }

  getCloseButtonClasses(toast: Toast): string {
    const baseClasses = 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 focus:ring-offset-2';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} focus:ring-green-500`;
      case 'error':
        return `${baseClasses} focus:ring-red-500`;
      case 'warning':
        return `${baseClasses} focus:ring-yellow-500`;
      case 'info':
        return `${baseClasses} focus:ring-blue-500`;
      default:
        return `${baseClasses} focus:ring-neutral-500`;
    }
  }

  getProgressBarClasses(toast: Toast): string {
    const baseClasses = 'animate-shrink-width';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-400`;
      case 'error':
        return `${baseClasses} bg-red-400`;
      case 'warning':
        return `${baseClasses} bg-yellow-400`;
      case 'info':
        return `${baseClasses} bg-blue-400`;
      default:
        return `${baseClasses} bg-neutral-400`;
    }
  }
}

// Toast Service (would be in a separate file)
export class ToastService {
  private toastContainer?: ToastContainerComponent;

  setContainer(container: ToastContainerComponent): void {
    this.toastContainer = container;
  }

  success(title: string, message?: string, options?: Partial<Toast>): void {
    this.show({ type: 'success', title, message, ...options });
  }

  error(title: string, message?: string, options?: Partial<Toast>): void {
    this.show({ type: 'error', title, message, ...options });
  }

  warning(title: string, message?: string, options?: Partial<Toast>): void {
    this.show({ type: 'warning', title, message, ...options });
  }

  info(title: string, message?: string, options?: Partial<Toast>): void {
    this.show({ type: 'info', title, message, ...options });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    if (this.toastContainer) {
      this.toastContainer.addToast(toast);
    }
  }
}