import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Defines the application's route configuration.
 * 
 * @constant
 * @type {Routes}
 * 
 * @property {Object[]} routes - Array of route objects.
 * @property {string} routes[].path - The URL path for the route.
 * @property {Function} [routes[].loadComponent] - Lazy loads the component associated with the route.
 * @property {any[]} [routes[].canActivate] - Guards that determine if the route can be activated.
 * @property {string} [routes[].redirectTo] - Redirects to a specified path.
 * @property {string} [routes[].pathMatch] - Specifies the matching strategy for the route.
 * 
 * @example
 * // Example usage:
 * // Navigating to '/login' will load the LoginComponent.
 * // Navigating to '/tasks' will load the TasksComponent if the authGuard allows it.
 * // Navigating to the root ('') will redirect to '/tasks'.
 */
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