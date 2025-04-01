import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./presentation/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./presentation/pages/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  }
];