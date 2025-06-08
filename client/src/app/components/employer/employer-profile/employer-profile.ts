import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

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

  selectedProfilePicture: File | null = null;

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

    const updatedEmployer = { ...this.employer };
    updatedEmployer.updatedAt = new Date().toISOString();

    // Remove password if empty
    if (!updatedEmployer.password || updatedEmployer.password.trim() === '') {
      delete updatedEmployer.password;
    }

    this.http.put(`${this.apiBase}/updateEmployer/${this.employerId}`, updatedEmployer)
      .subscribe({
        next: () => {
          this.success = 'Profile updated successfully!';
        },
        error: () => {
          this.error = 'Failed to update profile.';
        }
      });
  }

  uploadProfilePicture() {
    if (!this.employerId || !this.selectedProfilePicture) {
      alert('Please select a profile picture to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', this.selectedProfilePicture);

    this.http.post(`${this.apiBase}/uploadEmployerProfilePicture/${this.employerId}`, formData)
      .subscribe({
        next: (response: any) => {
          this.employer.profilePicture = response.filename;
          this.success = 'Profile picture uploaded successfully!';
        },
        error: () => {
          this.error = 'Failed to upload profile picture.';
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
          localStorage.removeItem('id');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
        error: () => {
          this.error = 'Failed to delete profile.';
        }
      });
  }

  getProfilePictureUrl(filename: string): string {
    return `${this.apiBase}/uploads/${filename}`;
  }

  onProfilePictureSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedProfilePicture = event.target.files[0];
    }
  }
}
