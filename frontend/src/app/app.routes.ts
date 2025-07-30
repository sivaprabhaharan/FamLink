import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'children',
    loadChildren: () => import('./features/children/children.routes').then(m => m.childrenRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'medical-records',
    loadChildren: () => import('./features/medical-records/medical-records.routes').then(m => m.medicalRecordsRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'community',
    loadChildren: () => import('./features/community/community.routes').then(m => m.communityRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'hospitals',
    loadChildren: () => import('./features/hospitals/hospitals.routes').then(m => m.hospitalsRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.appointmentsRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./features/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];