import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../../service/user.service';
import { AlertComponent } from '../../alert/alert.component';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ConfirmComponent],
  templateUrl: 'user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  userId: string | null = null;
  user: any = null;
  loading = false;
  error = '';
  success = '';
  token: string | null = null;

  resumeURL: SafeResourceUrl | null = null;

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  deleteSuccess: boolean = false;

  // Variables for Confirm
  confirmMessage: string = '';
  showConfirm: boolean = false;
  pendingDelete: boolean = false;


  private showCustomAlert(message: string, type: 'success' | 'error' | 'info') {
    console.log("Alert Triggered:", { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }

  // Called when the alert is closed by the user
  onAlertClosed(): void {
    this.showAlert = false;

    if (this.deleteSuccess) {
      this.router.navigate(['/login']);
    }
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.token = this.authService.getToken();
    if (!this.userId) {
      this.error = 'No user ID found.';
      return;
    }
    this.fetchuser();
  }

  fetchuser() {
    this.loading = true;
    this.userService.getUserData(this.userId!)
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

    this.userService.updateUserData(this.userId!, updatedUser, this.token!)
      .subscribe({
        next: (res: any) => {
          this.success = 'Profile updated successfully!';
          this.showCustomAlert(this.success, 'success');

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
    this.confirmMessage = 'Are you sure you want to delete your profile? This action cannot be undone.';
    this.showConfirm = true;
    this.pendingDelete = true;
  }

  onConfirmDelete() {
    if (this.pendingDelete && this.userId && this.token) {
      this.userService.deleteUser(this.userId, this.token).subscribe({
        next: () => {
          this.showCustomAlert('Profile deleted successfully.', 'success');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('id');
            localStorage.removeItem('token');
          }
          this.deleteSuccess = true;
        },
        error: () => {
          this.error = 'Failed to delete profile.';
        }
      });
    }
    this.resetConfirm();
  }

  onCancelConfirm() {
    this.resetConfirm();
  }

  private resetConfirm() {
    this.showConfirm = false;
    this.confirmMessage = '';
    this.pendingDelete = false;
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
        this.showCustomAlert('Only PDF files are allowed.', 'info');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.showCustomAlert('File size must be less than 2MB.', 'info');
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
    // If no resume data, do nothing
    if (!this.user?.resume?.data) return;

    // Convert base64-encoded resume data to a Blob for viewing/downloading
    const byteCharacters = atob(this.user.resume.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: this.user.resume.contentType });

    // Create a temporary object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Attempt to open the resume in a new browser tab
    const win = window.open(url, '_blank');

    // Fallback: If popup is blocked, trigger a download instead
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = 'resume.pdf';  // Optional: forces download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Revoke the object URL after a short delay to free memory
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
