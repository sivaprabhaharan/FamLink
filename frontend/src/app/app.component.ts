import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { NavigationComponent } from './core/components/navigation/navigation.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent,
    LoadingSpinnerComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <!-- Global Loading Spinner -->
      <app-loading-spinner 
        *ngIf="loadingService.isLoading$ | async"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      </app-loading-spinner>

      <!-- Navigation -->
      <app-navigation *ngIf="authService.isAuthenticated$ | async"></app-navigation>

      <!-- Main Content -->
      <main 
        class="transition-all duration-300"
        [class.ml-64]="authService.isAuthenticated$ | async"
        [class.ml-0]="!(authService.isAuthenticated$ | async)">
        <router-outlet></router-outlet>
      </main>

      <!-- Toast Notifications -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .main-content-authenticated {
      margin-left: 16rem; /* 64 * 0.25rem = 16rem */
    }

    @media (max-width: 768px) {
      .main-content-authenticated {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'FamLink - Family Health & Community Platform';

  // Inject services
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  loadingService = inject(LoadingService);

  ngOnInit(): void {
    // Initialize theme
    this.themeService.initializeTheme();

    // Initialize authentication state
    this.authService.initializeAuth();

    // Set up global error handling
    this.setupGlobalErrorHandling();

    // Set up PWA update handling
    this.setupPWAUpdates();
  }

  private setupGlobalErrorHandling(): void {
    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can add toast notification here
    });

    // Global error handler for JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // You can add toast notification here
    });
  }

  private setupPWAUpdates(): void {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Show update notification
        console.log('App updated! Please refresh the page.');
      });
    }
  }
}