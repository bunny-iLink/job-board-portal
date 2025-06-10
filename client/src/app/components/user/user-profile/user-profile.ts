import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  resumeURL: SafeResourceUrl | null = null;

  apiBase = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
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
            // Add this - create URL only after user data is loaded
            if (this.user?.resume?.data) {
              const url = `data:${this.user.resume.contentType};base64,${this.user.resume.data}`;
              this.resumeURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            }
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
        next: (res: any) => {
          this.success = 'Profile updated successfully!';

          // Update localStorage
          const newUser = res.user || updatedUser; // in case API returns the updated user
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(newUser));
          }
        },
        error: () => {
          this.error = 'Failed to update profile.';
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

  onProfilePictureSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.user.profilePicture = {
          data: base64,
          contentType: file.type
        };
      };
      reader.readAsDataURL(file);
    }
  }


  onResumeSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.user.resume = {
          data: base64,
          contentType: file.type
        };
        console.log(this.user.resume);

      };
      reader.readAsDataURL(file);
    }
  }

  openResume() {
    if (!this.user?.resume?.data) return;

    // Convert base64 to Blob
    const byteCharacters = atob(this.user.resume.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: this.user.resume.contentType });

    // Create object URL
    const url = URL.createObjectURL(blob);

    // Open in new tab
    const win = window.open(url, '_blank');

    // Fallback if blocked
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Alternative method if popup blocked
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = 'resume.pdf';  // Optional: forces download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Revoke the URL later
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
