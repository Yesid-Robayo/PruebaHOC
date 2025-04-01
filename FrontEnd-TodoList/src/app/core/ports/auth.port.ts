import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface AuthPort {
  login(email: string, password: string): Observable<User>;
  logout(): Observable<void>;
  getCurrentUser(): Observable<User | null>;
}