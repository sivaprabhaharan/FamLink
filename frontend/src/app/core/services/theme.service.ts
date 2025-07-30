import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'famlink-theme';
  
  // Signal for current theme
  currentTheme = signal<Theme>('system');
  
  // Signal for actual applied theme (resolved from system preference if needed)
  appliedTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // Effect to apply theme changes
    effect(() => {
      this.applyTheme(this.appliedTheme());
    });

    // Effect to resolve system theme when current theme changes
    effect(() => {
      const theme = this.currentTheme();
      if (theme === 'system') {
        this.appliedTheme.set(this.getSystemTheme());
      } else {
        this.appliedTheme.set(theme);
      }
    });

    // Listen for system theme changes
    this.setupSystemThemeListener();
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    this.currentTheme.set(savedTheme);
  }

  /**
   * Set theme preference
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.saveTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const current = this.currentTheme();
    if (current === 'system') {
      // If system, toggle to opposite of current system theme
      const systemTheme = this.getSystemTheme();
      this.setTheme(systemTheme === 'light' ? 'dark' : 'light');
    } else {
      // Toggle between light and dark
      this.setTheme(current === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Get current system theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#171717' : '#3b82f6');
      }
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.THEME_KEY) as Theme;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    }
    return 'system';
  }

  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        if (this.currentTheme() === 'system') {
          this.appliedTheme.set(this.getSystemTheme());
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
    }
  }

  /**
   * Get theme display name
   */
  getThemeDisplayName(theme: Theme): string {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  }

  /**
   * Get theme icon
   */
  getThemeIcon(theme: Theme): string {
    switch (theme) {
      case 'light':
        return 'sun';
      case 'dark':
        return 'moon';
      case 'system':
        return 'monitor';
      default:
        return 'monitor';
    }
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.appliedTheme() === 'dark';
  }

  /**
   * Check if current theme is light
   */
  isLight(): boolean {
    return this.appliedTheme() === 'light';
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): Theme[] {
    return ['light', 'dark', 'system'];
  }
}