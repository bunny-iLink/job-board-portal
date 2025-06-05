import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const loginData = this.loginForm.value;

    this.http.post('http://localhost:3000/api/login', loginData).subscribe({
      next: (response: any) => {
        alert('Login successful!');
        console.log(response);
        
        // Optional: Save token or user info here if returned
        localStorage.setItem('token', response.token);
        localStorage.setItem('id', JSON.stringify(response.user.id));
        this.router.navigate([`${response.user.role}/dashboard`]);  // adjust route as needed
      },
      error: (err: any) => {
        console.error('Login error:', err);
        alert('Invalid email or password.');
      }
    });
  }
}
