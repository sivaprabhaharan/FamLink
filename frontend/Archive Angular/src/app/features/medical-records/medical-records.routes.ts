import { Routes } from '@angular/router';

export const medicalRecordsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./medical-records.component').then(m => m.MedicalRecordsComponent)
  }
];
