import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { LocalStorageAuthAdapter } from '../../infrastructure/adapters/local-storage-auth.adapter';

/**
 * AuthGuard is a route guard that protects routes by checking if a user is authenticated.
 * 
 * This guard:
 * - Injects the authentication service (LocalStorageAuthAdapter) to check the current user
 * - Injects the Router service for navigation
 * - Returns an Observable that emits either:
 *   - `true` if there's an authenticated user (allowing access to the route)
 *   - A URL tree pointing to '/login' if no user is authenticated (redirecting to login)
 * 
 * Usage in routes:
 * {
 *   path: 'protected-route',
 *   component: ProtectedComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard = () => {
  // Inject required services
  const authService = inject(LocalStorageAuthAdapter);
  const router = inject(Router);

  // Check current user status
  return authService.getCurrentUser().pipe(
    // Map the user object to either true (allowed) or a redirect URL (denied)
    map(user => {
      if (user) {
        // User is authenticated - allow access
        return true;
      }
      // No authenticated user - redirect to login page
      return router.parseUrl('/login');
    })
  );
};