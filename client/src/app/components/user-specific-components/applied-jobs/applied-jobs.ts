// Angular component for displaying jobs the user has applied to
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { UserService } from '../../../service/user.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
import { AlertComponent } from '../../common/alert/alert.component';
import { ConfirmComponent } from '../../common/confirm/confirm.component';

@Component({
  selector: 'app-applied-jobs',
  imports: [CommonModule, AlertComponent, ConfirmComponent],
  standalone: true,
  templateUrl: './applied-jobs.html',
  styleUrls: ['./applied-jobs.css'],
})
export class AppliedJobsComponent implements OnInit {
  // User profile data
  user: any = null;
  // List of jobs the user has saved (not shown in template)
  savedJobs: any[] = [];
  // List of jobs the user has applied to
  appliedJobs: any[] = [];
  // User's unique ID
  userId: string | null = null;
  token: string | null = null;
  // Modal state and selected job for details
  selectedJob: any = null;
  showModal: boolean = false;
  loading: boolean = true;

  totalPages: number = 1;
  currentPage: number = 1;

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  // Variables for Confirm
  confirmMessage: string = '';
  showConfirm: boolean = false;
  applicationIdToBeDeleted = '';
  jobIdToBeDeleted: string = '';

  private showCustomAlert(
    message: string,
    type: 'success' | 'error' | 'info',
    navigate: boolean = false
  ) {
    console.log('Alert Triggered:', { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  // Called when the alert is closed by the user
  onAlertClosed(): void {
    this.showAlert = false;
  }

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private userService: UserService,
    private jobService: JobService
  ) {}

  // On component initialization, load user and applied jobs data
  ngOnInit(): void {
    this.loadUserData();
    this.token = this.authService.getToken();
  }

  // Load user data from localStorage and fetch from backend
  loadUserData() {
    if (typeof window !== 'undefined') {
      const userObject = this.authService.getUser(); // already parsed in AuthService

      if (userObject && userObject !== 'null') {
        this.userId = userObject._id; // safely access user ID

        // Fetch full user profile from backend
        this.userService.getUserData(this.userId!).subscribe({
          next: (res: any) => {
            this.user = res.user;
            console.log('User data:', this.user);
            this.loadAppliedJobs(); // Now load applied jobs
          },
          error: (err) => {
            console.error('Failed to load user data:', err);
          },
        });
      } else {
        console.warn('No valid user in localStorage.');
      }
    }
  }

  // Load jobs that the user has applied to from the backend
  // loadAppliedJobs() {
  //   if (!this.userId) return;

  //   this.loading = true; // Start loading

  //   this.jobService.appliedJobs(this.userId).subscribe({
  //     next: (res: any) => {
  //       this.appliedJobs = res.jobs || res;
  //       console.log('Applied jobs:', this.appliedJobs);
  //       this.loading = false; // Stop loading on success
  //     },
  //     error: (err) => {
  //       console.error('Failed to load applied jobs:', err);
  //       this.loading = false; // Stop loading on error
  //     },
  //   });
  // }
    loadAppliedJobs() {
    this.loading = true;
    this.jobService.appliedJobs(this.userId!, this.currentPage, 6).subscribe({
      next: (res) => {
        this.appliedJobs = res.jobs || res;
        this.totalPages = res.totalPages || 1;
      },
      error: (err) => console.error('Applied jobs error:', err),
      complete: () => (this.loading = false),
    });
  }

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadAppliedJobs();
      }
    }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAppliedJobs();
    }
  }

  // Open the modal to show job details
  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
    console.log('Job clicked:', job);
  }

  // Close the job details modal
  closeModal() {
    this.selectedJob = null;
    this.showModal = false;
  }

  // Revoke an application for a job
  revokeApplication(jobId: string) {
    if (!jobId) return;

    // Find the application to get the applicationId
    const application = this.appliedJobs.find((job) => job._id === jobId);
    if (!application) {
      this.showCustomAlert('Application not found!', 'info');
      return;
    }

    this.applicationIdToBeDeleted = application.applicationId;
    this.jobIdToBeDeleted = jobId;
    this.confirmMessage =
      'Are you sure you want to revoke your application for this job?';
    this.showConfirm = true;
  }

  onConfirmRevoke() {
    if (!this.applicationIdToBeDeleted || !this.token) return;

    this.applicationService
      .revokeApplication(this.applicationIdToBeDeleted, this.token)
      .subscribe({
        next: () => {
          this.showCustomAlert('Application revoked successfully!', 'success');
          this.appliedJobs = this.appliedJobs.filter(
            (job) => job._id !== this.jobIdToBeDeleted
          );
          this.resetConfirmState();
        },
        error: (err) => {
          console.error('Error revoking application:', err);
          this.showCustomAlert(
            `Failed to revoke application: ${
              err.error?.message || 'Unknown error'
            }`,
            'error'
          );
          this.resetConfirmState();
        },
      });
  }

  onCancelConfirm() {
    this.resetConfirmState();
  }

  private resetConfirmState() {
    this.showConfirm = false;
    this.confirmMessage = '';
    this.applicationIdToBeDeleted = '';
    this.jobIdToBeDeleted = '';
  }
}
