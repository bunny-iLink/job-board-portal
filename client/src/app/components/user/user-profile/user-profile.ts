import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  userId: string | null = null;
  user: any = null;
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
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.error = 'No user ID found.';
      return;
    }
    this.fetchuser();
  }

  fetchuser() {
    this.loading = true;
    this.http.get(`${this.apiBase}/getUserData/${this.userId}`)
      .subscribe({
        next: (data: any) => {
          this.user = data.user;
          if (this.user) {
            this.user.password = '';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load user data.';
          this.loading = false;
        }
      });
  }

  updateProfile() {
    if (!this.userId) return;

    this.success = '';
    this.error = '';

    const updatedUser = { ...this.user };
    updatedUser.updatedAt = new Date().toISOString();

    // Remove password field if it's empty or just whitespace
    if (!updatedUser.password || updatedUser.password.trim() === '') {
      delete updatedUser.password;
    }

    this.http.put(`${this.apiBase}/updateUser/${this.userId}`, updatedUser)
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
    if (!this.userId || !this.selectedProfilePicture) {
      alert('Please select a profile picture to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', this.selectedProfilePicture);

    this.http.post(`${this.apiBase}/uploadUserProfilePicture/${this.userId}`, formData)
      .subscribe({
        next: (response: any) => {
          this.user.profilePicture = response.filename;
          this.success = 'Profile picture uploaded successfully!';
        },
        error: () => {
          this.error = 'Failed to upload profile picture.';
        }
      });
  }


  deleteProfile() {
    if (!this.userId) return;

    if (!confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    this.http.delete(`${this.apiBase}/deleteUser/${this.userId}`)
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

  getProfilePictureUrl(filename: string): string {
    return `${this.apiBase}/uploads/${filename}`;
  }

  onProfilePictureSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedProfilePicture = event.target.files[0];
    }
  }
}
