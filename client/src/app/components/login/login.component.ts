// Angular component for handling user login functionality
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Reactive form group for login
  loginForm: FormGroup;
  // Controls password visibility
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private loginService: LoginService
  ) {
    // Initialize the login form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Toggle password visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Navigate to the registration page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Handle form submission for login
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData = this.loginForm.value;

    // Send login request to backend API
    this.loginService.login(loginData).subscribe({
      next: (response: any) => {
        alert('Login successful!');
        console.log(response);

        // Save token and user info to localStorage (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        const role = response.user?.role;
        if (role) {
          this.router.navigate([`/${role}/dashboard`]);
        } else {
          console.warn('User role not found. Redirecting to fallback...');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        // Handle login error
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
