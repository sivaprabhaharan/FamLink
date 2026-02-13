import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal-based state management
  private loadingCountSignal = signal<number>(0);
  private loadingStatesSignal = signal<Map<string, boolean>>(new Map());

  // Computed signals
  isLoading = computed(() => this.loadingCountSignal() > 0);
  hasSpecificLoading = computed(() => this.loadingStatesSignal().size > 0);

  // Observable versions for compatibility
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private loadingStatesSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  loadingStates$ = this.loadingStatesSubject.asObservable();

  constructor() {
    // Sync signals with observables
    this.syncSignalsWithObservables();
  }

  /**
   * Show global loading spinner
   */
  show(): void {
    this.loadingCountSignal.update(count => count + 1);
  }

  /**
   * Hide global loading spinner
   */
  hide(): void {
    this.loadingCountSignal.update(count => Math.max(0, count - 1));
  }

  /**
   * Show loading for a specific key
   */
  showFor(key: string): void {
    this.loadingStatesSignal.update(states => {
      const newStates = new Map(states);
      newStates.set(key, true);
      return newStates;
    });
  }

  /**
   * Hide loading for a specific key
   */
  hideFor(key: string): void {
    this.loadingStatesSignal.update(states => {
      const newStates = new Map(states);
      newStates.delete(key);
      return newStates;
    });
  }

  /**
   * Check if loading for a specific key
   */
  isLoadingFor(key: string): boolean {
    return this.loadingStatesSignal().has(key);
  }

  /**
   * Get observable for specific loading state
   */
  isLoadingFor$(key: string): Observable<boolean> {
    return new Observable(observer => {
      const checkLoading = () => {
        observer.next(this.isLoadingFor(key));
      };

      // Initial check
      checkLoading();

      // Set up interval to check for changes
      const interval = setInterval(checkLoading, 50);

      // Cleanup
      return () => clearInterval(interval);
    });
  }

  /**
   * Execute a function with loading state
   */
  async withLoading<T>(fn: () => Promise<T>): Promise<T> {
    this.show();
    try {
      return await fn();
    } finally {
      this.hide();
    }
  }

  /**
   * Execute a function with specific loading key
   */
  async withLoadingFor<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this.showFor(key);
    try {
      return await fn();
    } finally {
      this.hideFor(key);
    }
  }

  /**
   * Wrap an observable with loading state
   */
  wrapObservable<T>(observable: Observable<T>): Observable<T> {
    return new Observable(observer => {
      this.show();
      
      const subscription = observable.subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          this.hide();
          observer.error(error);
        },
        complete: () => {
          this.hide();
          observer.complete();
        }
      });

      return () => {
        this.hide();
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Wrap an observable with specific loading key
   */
  wrapObservableFor<T>(key: string, observable: Observable<T>): Observable<T> {
    return new Observable(observer => {
      this.showFor(key);
      
      const subscription = observable.subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          this.hideFor(key);
          observer.error(error);
        },
        complete: () => {
          this.hideFor(key);
          observer.complete();
        }
      });

      return () => {
        this.hideFor(key);
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Reset all loading states
   */
  reset(): void {
    this.loadingCountSignal.set(0);
    this.loadingStatesSignal.set(new Map());
  }

  /**
   * Get all active loading keys
   */
  getActiveLoadingKeys(): string[] {
    return Array.from(this.loadingStatesSignal().keys());
  }

  /**
   * Get loading count
   */
  getLoadingCount(): number {
    return this.loadingCountSignal();
  }

  /**
   * Check if any loading is active
   */
  hasAnyLoading(): boolean {
    return this.isLoading() || this.hasSpecificLoading();
  }

  // Private methods

  private syncSignalsWithObservables(): void {
    // Update BehaviorSubjects when signals change
    setInterval(() => {
      this.isLoadingSubject.next(this.isLoading());
      this.loadingStatesSubject.next(new Map(this.loadingStatesSignal()));
    }, 50);
  }
}

// Loading decorator for methods
export function WithLoading(loadingService?: LoadingService, key?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const service = loadingService || (this as any).loadingService;
      
      if (!service) {
        console.warn('LoadingService not found for @WithLoading decorator');
        return method.apply(this, args);
      }

      if (key) {
        return service.withLoadingFor(key, () => method.apply(this, args));
      } else {
        return service.withLoading(() => method.apply(this, args));
      }
    };
  };
}

// Loading state interface for components
export interface LoadingState {
  isLoading: boolean;
  loadingKeys: string[];
  isLoadingFor: (key: string) => boolean;
}

// Helper function to create loading state
export function createLoadingState(loadingService: LoadingService): LoadingState {
  return {
    get isLoading() {
      return loadingService.isLoading();
    },
    get loadingKeys() {
      return loadingService.getActiveLoadingKeys();
    },
    isLoadingFor: (key: string) => loadingService.isLoadingFor(key)
  };
}