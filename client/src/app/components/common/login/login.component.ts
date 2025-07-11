import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { AlertComponent } from '../../common/alert/alert.component';

enum AlertType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  // Alert state
  alertMessage = '';
  alertType: AlertType = AlertType.Info;
  showAlert = false;
  shouldNavigateAfterAlert = false;

  private user: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) this.navigateToRoleDashboard();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        this.showCustomAlert('Login successful!', AlertType.Success, true);
      },
      error: (error) => {
        const message = this.getErrorMessage(error.status);
        this.showCustomAlert(message, AlertType.Error);
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onAlertClosed(): void {
    this.showAlert = false;
    if (this.shouldNavigateAfterAlert) {
      this.navigateToRoleDashboard();
    }
  }

  private showCustomAlert(
    message: string,
    type: AlertType,
    navigate: boolean = false
  ): void {
    console.log('Alert Triggered:', { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.shouldNavigateAfterAlert = navigate;
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Please enter both email and password.';
      case 404:
        return 'No account found with this email.';
      case 401:
        return 'Incorrect email or password. Please try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  private navigateToRoleDashboard(): void {
    const user = this.user || JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role;
    this.router.navigate([role ? `/${role}/dashboard` : '/']);
  }
}
