import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { EmployerService } from '../../../service/employer.service';
import { AlertComponent } from '../../alert/alert.component';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'app-employer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ConfirmComponent],
  templateUrl: 'employer-profile.html',
  styleUrls: ['./employer-profile.css'],
})
export class EmployerProfileComponent implements OnInit {
  employerId: string | null = null;
  employer: any = null;
  loading = false;
  error = '';
  success = '';
  token: string | null = null;

  selectedBase64: string | null = null;
  selectedMimeType: string | null = null;
  previewImage: string | null = null;

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;

  // Variables for confirm
  confirmMessage: string = '';
  showConfirm: boolean = false;

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info') {
    console.log('Alert Triggered:', { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }

  onAlertClosed(): void {
    this.showAlert = false;
  }

  private showCustomConfirm(message: string) {
    this.confirmMessage = message;
    this.showConfirm = true;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private employerService: EmployerService
  ) {}

  ngOnInit() {
    this.employerId = this.authService.getUserId();
    this.token = this.authService.getToken();
    if (!this.employerId) {
      this.error = 'No employer ID found.';
      return;
    }
    this.fetchEmployer();
  }

  fetchEmployer() {
    this.loading = true;
    this.employerService
      .getEmployerData(this.employerId!, this.token!)
      .subscribe({
        next: (data: any) => {
          this.employer = data.employer;
          if (this.employer) {
            this.employer.password = '';
          }
        },
        error: () => {
          this.error = 'Failed to load employer data.';
        },
        complete: () => {
          this.loading = false;
        },
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
        contentType: this.selectedMimeType,
      };
    }

    this.employerService
      .updateEmployer(this.employerId!, updatedEmployer, this.token!)
      .subscribe({
        next: () => {
          this.success = 'Profile updated successfully!';
          this.previewImage = null;
          this.selectedBase64 = null;
          this.selectedMimeType = null;
          this.showCustomAlert(this.success, 'success');
        },
        error: () => {
          this.error = 'Failed to update profile.';
        },
      });
  }

  deleteProfile() {
    // If employer ID is missing, do nothing
    if (!this.employerId) return;

    // Confirm with the user before deleting the profile
    this.showCustomConfirm(
      'Are you sure you want to delete your profile? This action cannot be undone.'
    );
  }

  onConfirmDelete() {
    // Send DELETE request to backend to remove employer profile
    this.employerService
      .deleteEmployer(this.employerId!, this.token!)
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
        },
      });
  }

  onCancelDelete() {
    this.showConfirm = false;
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
