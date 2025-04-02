import { Observable } from 'rxjs';
import { User } from '../models/user.model';

/**
 * Interface representing the authentication port for handling user authentication operations.
 */
export interface AuthPort {
  /**
   * Logs in a user with the provided email and password.
   * 
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns An observable that emits the authenticated user.
   */
  login(email: string, password: string): Observable<User>;

  /**
   * Logs out the currently authenticated user.
   * 
   * @returns An observable that completes when the logout operation is finished.
   */
  logout(): Observable<void>;

  /**
   * Retrieves the currently authenticated user, if any.
   * 
   * @returns An observable that emits the current user or null if no user is authenticated.
   */
  getCurrentUser(): Observable<User | null>;
}