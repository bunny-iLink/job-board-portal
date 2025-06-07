import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-employer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employer-profile.html',
  styleUrls: ['./employer-profile.css']
})
export class EmployerProfileComponent implements OnInit {
  employerId: string | null = null;
  employer: any = null;
  loading = false;
  error = '';
  success = '';

  apiBase = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.employerId = this.authService.getUserId();
    if (!this.employerId) {
      this.error = 'No employer ID found.';
      return;
    }
    this.fetchEmployer();
  }

  fetchEmployer() {
    this.loading = true;
    this.http.get(`${this.apiBase}/getEmployerData/${this.employerId}`)
      .subscribe({
        next: (data: any) => {
          this.employer = data.employer;
          if (this.employer) {
            this.employer.password = '';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load employer data.';
          this.loading = false;
        }
      });
  }

  updateProfile() {
    if (!this.employerId) return;

    this.success = '';
    this.error = '';

    this.employer.updatedAt = new Date().toISOString();

    this.http.put(`${this.apiBase}/updateEmployer/${this.employerId}`, this.employer)
      .subscribe({
        next: () => {
          this.success = 'Profile updated successfully!';
        },
        error: () => {
          this.error = 'Failed to update profile.';
        }
      });
  }

  deleteProfile() {
    if (!this.employerId) return;

    if (!confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    this.http.delete(`${this.apiBase}/deleteEmployer/${this.employerId}`)
      .subscribe({
        next: () => {
          alert('Profile deleted successfully.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('id');
            localStorage.removeItem('token');
          }
          this.router.navigate(['/login']);
        },
        error: () => {
          this.error = 'Failed to delete profile.';
        }
      });
  }
}
