import { Routes } from '@angular/router';

export const childrenRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./children.component').then(m => m.ChildrenComponent)
  }
];
