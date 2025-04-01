import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputComponent } from '../../atoms/input/input.component';
import { LocalStorageAuthAdapter } from '../../../infrastructure/adapters/local-storage-auth.adapter';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']

})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authAdapter: LocalStorageAuthAdapter,
    private router: Router
  ) { }

  onSubmit(): void {
    this.authAdapter.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Handle error (show message to user)
      }
    });
  }
}