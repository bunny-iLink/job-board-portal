// Angular component for handling user login functionality
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../service/login.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Reactive form group for login
  loginForm: FormGroup;
  // Controls password visibility
  showPassword: boolean = false;

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info', navigate: boolean = false) {
    console.log("Alert Triggered:", { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  // Called when the alert is closed by the user
  onAlertClosed(): void {
    this.showAlert = false;
    if (this.navigateAfterAlert) {
      const user = localStorage.getItem('user');
      const role = user ? JSON.parse(user).role : null;
      this.router.navigate([role ? `/${role}/dashboard` : '/']);
    }
  }

  constructor(
    private fb: FormBuilder,
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

    this.loginService.login(loginData).subscribe({
      next: (response: any) => {
        console.log(response);

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        this.showCustomAlert('Login successful!', 'success', true);
      },
      error: () => {
        this.showCustomAlert('Login failed. Please check your credentials.', 'error');
      }
    });
  }
}
