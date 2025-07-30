import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div class="relative">
        <!-- Main spinner -->
        <div 
          class="animate-spin rounded-full border-solid border-t-transparent"
          [class]="spinnerClass"
          [style.width.px]="size"
          [style.height.px]="size"
          [style.border-width.px]="borderWidth">
        </div>
        
        <!-- Inner spinner for double effect -->
        <div 
          *ngIf="variant === 'double'"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-solid border-t-transparent"
          [class]="innerSpinnerClass"
          [style.width.px]="size * 0.6"
          [style.height.px]="size * 0.6"
          [style.border-width.px]="borderWidth * 0.8"
          style="animation-direction: reverse;">
        </div>
      </div>
      
      <!-- Loading text -->
      <span 
        *ngIf="showText" 
        class="ml-3 text-sm font-medium"
        [class]="textClass">
        {{ text }}
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 32;
  @Input() color: 'primary' | 'secondary' | 'white' | 'neutral' = 'primary';
  @Input() variant: 'single' | 'double' | 'dots' = 'single';
  @Input() showText: boolean = false;
  @Input() text: string = 'Loading...';
  @Input() containerClass: string = '';

  get spinnerClass(): string {
    const baseClasses = 'border-2';
    
    switch (this.color) {
      case 'primary':
        return `${baseClasses} border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400`;
      case 'secondary':
        return `${baseClasses} border-secondary-200 border-t-secondary-600 dark:border-secondary-800 dark:border-t-secondary-400`;
      case 'white':
        return `${baseClasses} border-white/30 border-t-white`;
      case 'neutral':
        return `${baseClasses} border-neutral-200 border-t-neutral-600 dark:border-neutral-700 dark:border-t-neutral-300`;
      default:
        return `${baseClasses} border-primary-200 border-t-primary-600`;
    }
  }

  get innerSpinnerClass(): string {
    const baseClasses = 'border-2';
    
    switch (this.color) {
      case 'primary':
        return `${baseClasses} border-primary-300 border-t-primary-500 dark:border-primary-700 dark:border-t-primary-300`;
      case 'secondary':
        return `${baseClasses} border-secondary-300 border-t-secondary-500 dark:border-secondary-700 dark:border-t-secondary-300`;
      case 'white':
        return `${baseClasses} border-white/20 border-t-white/80`;
      case 'neutral':
        return `${baseClasses} border-neutral-300 border-t-neutral-500 dark:border-neutral-600 dark:border-t-neutral-400`;
      default:
        return `${baseClasses} border-primary-300 border-t-primary-500`;
    }
  }

  get textClass(): string {
    switch (this.color) {
      case 'primary':
        return 'text-primary-600 dark:text-primary-400';
      case 'secondary':
        return 'text-secondary-600 dark:text-secondary-400';
      case 'white':
        return 'text-white';
      case 'neutral':
        return 'text-neutral-600 dark:text-neutral-400';
      default:
        return 'text-primary-600 dark:text-primary-400';
    }
  }

  get borderWidth(): number {
    if (this.size <= 16) return 1;
    if (this.size <= 24) return 2;
    if (this.size <= 32) return 2;
    if (this.size <= 48) return 3;
    return 4;
  }
}