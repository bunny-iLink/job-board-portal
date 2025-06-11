// Angular component for handling user registration functionality
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Reactive form group for registration
  registerForm: FormGroup;
  // Stores the selected user role (candidate or employer)
  selectedRole: string = '';
  // Controls password visibility
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    // Initialize the registration form with validators
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      company: [''],
      preferredDomain: ['']
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

  // Handle form submission for registration
  onSubmit() {
    if (!this.selectedRole || this.registerForm.invalid) return;

    const userData = this.registerForm.value;

    // Choose API endpoint based on selected role
    const url = this.selectedRole === 'candidate' 
      ? environment.apiUrl + '/api/addUser'
      : environment.apiUrl +'/api/addEmployer';

    // Send registration request to backend API
    this.http.post(url, userData).subscribe({
      next: res => {
        alert('Registration successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: err => {
        alert('Registration failed. Please try again.');
      }
    });
  }
}
