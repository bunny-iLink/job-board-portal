import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService } from '../../../service/auth.service';
import { UserService } from '../../../service/user.service';
import { EmployerService } from '../../../service/employer.service';
import { AlertComponent } from '../../common/alert/alert.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ConfirmComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  role: 'user' | 'employer' | null = null;

  userOrEmployer: any = null;
  userId: string | null = null;
  token: string | null = null;
  loading = false;
  error = '';
  success = '';

  resumeURL: SafeResourceUrl | null = null;

  // Alert/Confirm state
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert = false;

  confirmMessage = '';
  showConfirm = false;
  deleteSuccess = false;
  pendingDelete = false;

  selectedBase64: string | null = null;
  selectedMimeType: string | null = null;
  previewImage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private employerService: EmployerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userId = this.authService.getUserId();
    const user = this.authService.getUser();
    this.role = user?.role ?? null;

    if (!this.userId || !this.token || !this.role) {
      this.error = 'Invalid session. Please log in again.';
      return;
    }

    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;

    if (this.role === 'user') {
      this.userService.getUserData(this.userId!).subscribe({
        next: (res: any) => {
          this.userOrEmployer = res.user;
          this.userOrEmployer.password = '';

          if (this.userOrEmployer?.resume?.data) {
            const url = `data:${this.userOrEmployer.resume.contentType};base64,${this.userOrEmployer.resume.data}`;
            this.resumeURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
        },
        error: () => this.error = 'Failed to load user data.',
        complete: () => this.loading = false
      });
    } else if (this.role === 'employer') {
      this.employerService.getEmployerData(this.userId!, this.token!).subscribe({
        next: (res: any) => {
          this.userOrEmployer = res.employer;
          this.userOrEmployer.password = '';
        },
        error: () => this.error = 'Failed to load employer data.',
        complete: () => this.loading = false
      });
    }
  }

  updateProfile(): void {
    const updated = { ...this.userOrEmployer };
    updated.updatedAt = new Date().toISOString();

    if (!updated.password?.trim()) delete updated.password;

    if (this.selectedBase64 && this.selectedMimeType) {
      updated.profilePicture = {
        data: this.selectedBase64,
        contentType: this.selectedMimeType,
      };
    }

    const update$ = this.role === 'user'
      ? this.userService.updateUserData(this.userId!, updated, this.token!)
      : this.employerService.updateEmployer(this.userId!, updated, this.token!);

    update$.subscribe({
      next: (res: any) => {
        this.success = 'Profile updated successfully!';
        this.showAlert = true;
        this.alertMessage = this.success;
        this.alertType = 'success';
        this.selectedBase64 = null;
        this.selectedMimeType = null;
        this.previewImage = null;
        this.fetchData(); 

        // Optional: update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.user || updated));
        }
      },
      error: () => this.error = 'Failed to update profile.'
    });
  }

  deleteProfile(): void {
    this.confirmMessage = 'Are you sure you want to delete your profile?';
    this.showConfirm = true;
    this.pendingDelete = true;
  }

  onConfirmDelete(): void {
    const delete$ = this.role === 'user'
      ? this.userService.deleteUser(this.userId!, this.token!)
      : this.employerService.deleteEmployer(this.userId!, this.token!);

    delete$.subscribe({
      next: () => {
        this.alertMessage = 'Profile deleted successfully.';
        this.alertType = 'success';
        this.showAlert = true;
        this.deleteSuccess = true;
        this.authService.logout();
      },
      error: () => this.error = 'Failed to delete profile.'
    });

    this.showConfirm = false;
  }

  onCancelDelete(): void {
    this.showConfirm = false;
    this.confirmMessage = '';
    this.pendingDelete = false;
  }

  onAlertClosed(): void {
    this.showAlert = false;
    if (this.deleteSuccess) this.router.navigate(['/login']);
  }

  onProfilePictureSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.alertMessage = 'File size must be less than 2MB';
      this.alertType = 'info';
      this.showAlert = true;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.selectedBase64 = base64;
      this.selectedMimeType = file.type;
      this.previewImage = `data:${file.type};base64,${base64}`;
    };
    reader.readAsDataURL(file);
  }

  onResumeSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file || this.role !== 'user') return;

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
      this.userOrEmployer.resume = {
        data: base64,
        contentType: file.type
      };
    };
    reader.readAsDataURL(file);
  }

  openResume(): void {
    if (this.role !== 'user' || !this.userOrEmployer?.resume?.data) return;

    const byteCharacters = atob(this.userOrEmployer.resume.data);
    const byteArray = new Uint8Array(byteCharacters.split('').map(c => c.charCodeAt(0)));
    const blob = new Blob([byteArray], { type: this.userOrEmployer.resume.contentType });
    const url = URL.createObjectURL(blob);

    const win = window.open(url, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }
}
