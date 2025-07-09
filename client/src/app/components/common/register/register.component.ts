// Angular component for handling user registration functionality
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RegisterService } from '../../../service/register.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  // Reactive form group for registration
  registerForm: FormGroup;
  // Stores the selected user role (candidate or employer)
  selectedRole: string = '';
  // Controls password visibility
  showPassword: boolean = false;

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;
  registrationSuccess: boolean = false;

  private showCustomAlert(
    message: string,
    type: 'success' | 'error' | 'info',
    navigate: boolean = false
  ) {
    console.log('Alert Triggered:', { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  // Called when the alert is closed by the user
  onAlertClosed(): void {
    this.showAlert = false;
    if (this.registrationSuccess) {
      this.router.navigate(['/login']);
    }
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private registerService: RegisterService
  ) {
    // Initialize the registration form with validators
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      company: [''],
      preferredDomain: [''],
    });
  }

  // Set the selected role when a button is clicked
  selectRole(role: string) {
    this.selectedRole = role;
  }

  // Toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Handle form submission for registration
  onSubmit() {
    if (!this.selectedRole || this.registerForm.invalid) {
      this.showCustomAlert(
        'Please fill all required fields and select a role.',
        'error'
      );
      return;
    }

    const userData = this.registerForm.value;

    const url =
      this.selectedRole === 'candidate'
        ? environment.apiUrl + '/addUser'
        : environment.apiUrl + '/addEmployer';

    this.registerService.register(url, userData).subscribe({
      next: (res) => {
        this.showCustomAlert(
          'Registration successful. Please log in....',
          'success'
        );
        this.registrationSuccess = true;
      },
      error: (err) => {
        let errorMessage = 'Registration failed. Please try again.';
        const status = err.status;

        if (status === 400) {
          errorMessage = err.message;
        } else if (status === 409) {
          errorMessage = 'An account with this email already exists.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        this.showCustomAlert(errorMessage, 'error');
      },
    });
  }
}
