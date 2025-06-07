import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData = this.loginForm.value;

    this.http.post('http://localhost:3000/api/login', loginData).subscribe({
      next: (response: any) => {
        alert('Login successful!');
        console.log(response);

        // ✅ Save token and user safely
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        const role = response.user?.role;
        if (role) {
          this.router.navigate([`/${role}/dashboard`]);
        } else {
          console.warn('User role not found. Redirecting to fallback...');
          this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        alert('Invalid email or password.');
      }
    });
  }
}
