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
  registerForm: FormGroup;
  selectedRole: string = '';
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      company: [''],
      preferredDomain: ['']
    });
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.selectedRole || this.registerForm.invalid) return;

    const userData = this.registerForm.value;

    const url = this.selectedRole === 'candidate' 
      ? environment.apiUrl + '/api/addUser'
      : environment.apiUrl +'/api/addEmployer';

    this.http.post(url, userData).subscribe({
      next: res => {
      alert('Registration successful! Please log in.');
      this.router.navigate(['/login']);
    },

      error: err =>{ 
      console.error('Error:', err);
      alert('Registration failed. Please try again.');
      }
    });
    
  }
}
