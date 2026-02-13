import { Routes } from '@angular/router';

export const communityRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./community.component').then(m => m.CommunityComponent)
  }
];
