import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputComponent } from '../../atoms/input/input.component';
import { LocalStorageAuthAdapter } from '../../../infrastructure/adapters/local-storage-auth.adapter';

/**
 * LoginComponent handles user authentication and login functionality.
 * 
 * Features:
 * - Provides a login form with email and password fields
 * - Integrates with authentication service (LocalStorageAuthAdapter)
 * - Handles form submission and navigation
 * - Uses reusable atomic components (Button, Input)
 * 
 * Behavior:
 * - On successful login: redirects to '/tasks' route
 * - On failed login: logs error to console (TODO: implement user-facing error message)
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  /**
   * User's email address (form model)
   */
  email = '';

  /**
   * User's password (form model)
   */
  password = '';

  /**
   * Creates an instance of LoginComponent
   * @param authAdapter Authentication service for login operations
   * @param router Angular Router for navigation
   */
  constructor(
    private authAdapter: LocalStorageAuthAdapter,
    private router: Router
  ) { }

  /**
   * Handles form submission
   * - Validates credentials via authAdapter
   * - Navigates to tasks page on success
   * - Handles errors (currently just logs to console)
   */
  onSubmit(): void {
    this.authAdapter.login(this.email, this.password).subscribe({
      next: () => {
        // Successful login - redirect to tasks page
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        // TODO: Implement user-friendly error notification
        // Consider adding error state to display in template
      }
    });
  }
}