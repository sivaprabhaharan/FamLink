import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fixed left-0 top-0 h-full w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 shadow-lg z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0"
         [class.translate-x-0]="isOpen()"
         [class.-translate-x-full]="!isOpen()">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gradient">FamLink</h1>
        </div>
        
        <!-- Mobile close button -->
        <button 
          class="lg:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
          (click)="toggleSidebar()">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- User Profile Section -->
      <div class="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div class="flex items-center space-x-3">
          <img 
            [src]="currentUser()?.profilePictureUrl || '/assets/images/default-avatar.png'"
            [alt]="currentUser()?.firstName + ' ' + currentUser()?.lastName"
            class="w-10 h-10 rounded-full object-cover">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {{ currentUser()?.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Items -->
      <div class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-3">
          <li *ngFor="let item of navigationItems">
            <a 
              [routerLink]="item.route"
              routerLinkActive="nav-link-active"
              #rla="routerLinkActive"
              class="nav-link group"
              [class.nav-link-active]="rla.isActive"
              [class.nav-link-inactive]="!rla.isActive">
              
              <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  [attr.d]="getIconPath(item.icon)" />
              </svg>
              
              <span class="flex-1">{{ item.label }}</span>
              
              <span 
                *ngIf="item.badge && item.badge > 0"
                class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Footer Actions -->
      <div class="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-2">
        <!-- Theme Toggle -->
        <button 
          class="w-full nav-link nav-link-inactive justify-start"
          (click)="toggleTheme()">
          <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              *ngIf="themeService.isDark()"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            <path 
              *ngIf="!themeService.isDark()"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span>{{ themeService.isDark() ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>

        <!-- Settings -->
        <a 
          routerLink="/settings"
          class="w-full nav-link nav-link-inactive justify-start">
          <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </a>

        <!-- Logout -->
        <button 
          class="w-full nav-link nav-link-inactive justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          (click)="logout()">
          <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>

    <!-- Mobile Overlay -->
    <div 
      *ngIf="isOpen()"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      (click)="closeSidebar()">
    </div>

    <!-- Mobile Menu Button -->
    <button 
      class="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700"
      (click)="toggleSidebar()">
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavigationComponent {
  // Inject services
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  // Signals
  isOpen = signal(false);
  currentUser = this.authService.currentUser;

  navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'home',
      route: '/dashboard'
    },
    {
      label: 'My Profile',
      icon: 'user',
      route: '/profile'
    },
    {
      label: 'Children',
      icon: 'users',
      route: '/children'
    },
    {
      label: 'Medical Records',
      icon: 'clipboard',
      route: '/medical-records'
    },
    {
      label: 'Community',
      icon: 'chat',
      route: '/community',
      badge: 3 // Example badge
    },
    {
      label: 'Find Hospitals',
      icon: 'location',
      route: '/hospitals'
    },
    {
      label: 'Appointments',
      icon: 'calendar',
      route: '/appointments'
    },
    {
      label: 'AI Pediatrician',
      icon: 'bot',
      route: '/chatbot'
    }
  ];

  toggleSidebar(): void {
    this.isOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.isOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }

  getIconPath(icon: string): string {
    const iconPaths: Record<string, string> = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      clipboard: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      bot: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    };
    
    return iconPaths[icon] || iconPaths['home'];
  }
}