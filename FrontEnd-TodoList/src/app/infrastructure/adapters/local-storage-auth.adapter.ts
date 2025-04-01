import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthPort } from '../../core/ports/auth.port';
import { User } from '../../core/models/user.model';

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