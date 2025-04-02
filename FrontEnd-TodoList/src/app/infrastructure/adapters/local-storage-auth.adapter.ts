import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthPort } from '../../core/ports/auth.port';
import { User } from '../../core/models/user.model';

/**
 * Service adapter for handling authentication using local storage.
 * Implements the `AuthPort` interface.
 *
 * @description
 * This service provides methods for logging in, logging out, and retrieving
 * the current user from the browser's local storage. It is a simple implementation
 * for demonstration purposes and should not be used in production without proper
 * security measures.
 *
 * @example
 * // Inject the service and use its methods
 * constructor(private authAdapter: LocalStorageAuthAdapter) {}
 *
 * this.authAdapter.login('user@example.com', 'password').subscribe(user => {
 *   console.log('Logged in user:', user);
 * });
 *
 * this.authAdapter.logout().subscribe(() => {
 *   console.log('User logged out');
 * });
 *
 * this.authAdapter.getCurrentUser().subscribe(user => {
 *   console.log('Current user:', user);
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageAuthAdapter implements AuthPort {
  private readonly STORAGE_KEY = 'currentUser';

  login(email: string, password: string): Observable<User> {
    // Simple local authentication
    if (email && password) {
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0]
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return of(user);
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  logout(): Observable<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    return of(void 0);
  }

  getCurrentUser(): Observable<User | null> {
    const user = localStorage.getItem(this.STORAGE_KEY);
    return of(user ? JSON.parse(user) : null);
  }
}