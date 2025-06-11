import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'employer-profile.html',
  styleUrls: ['./employer-profile.css']
})
export class EmployerProfileComponent implements OnInit {
  employerId: string | null = null;
  employer: any = null;
  loading = false;
  error = '';
  success = '';

  selectedBase64: string | null = null;
  selectedMimeType: string | null = null;
  previewImage: string | null = null;

  apiBase = environment.apiUrl + '/api';

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

    if (!updatedEmployer.password || updatedEmployer.password.trim() === '') {
      delete updatedEmployer.password;
    }

    // Attach profilePicture only if a new one was selected
    if (this.selectedBase64 && this.selectedMimeType) {
      updatedEmployer.profilePicture = {
        data: this.selectedBase64,
        contentType: this.selectedMimeType
      };
    }

    this.http.put(`${this.apiBase}/updateEmployer/${this.employerId}`, updatedEmployer)
      .subscribe({
        next: () => {
          this.success = 'Profile updated successfully!';
          this.previewImage = null;
          this.selectedBase64 = null;
          this.selectedMimeType = null;
        },
        error: () => {
          this.error = 'Failed to update profile.';
        }
      });
  }

  deleteProfile() {
    // If employer ID is missing, do nothing
    if (!this.employerId) return;

    // Confirm with the user before deleting the profile
    if (!confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    // Send DELETE request to backend to remove employer profile
    this.http.delete(`${this.apiBase}/deleteEmployer/${this.employerId}`)
      .subscribe({
        next: () => {
          alert('Profile deleted successfully.');
          // Remove session data from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('id');
            localStorage.removeItem('token');
          }
          // Redirect to login page
          this.router.navigate(['/login']);
        },
        error: () => {
          this.error = 'Failed to delete profile.';
        }
      });
  }

  onProfilePictureSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.selectedBase64 = base64;
      this.selectedMimeType = file.type;
      this.previewImage = `data:${file.type};base64,${base64}`;
    };
    reader.onerror = () => {
      this.error = 'Failed to read image file.';
    };
    reader.readAsDataURL(file);
  }
}
