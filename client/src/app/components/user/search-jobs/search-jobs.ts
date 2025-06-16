import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
import { AlertComponent } from '../../alert/alert.component';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'app-search-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ConfirmComponent],
  templateUrl: 'search-jobs.html',
  styleUrls: ['search-jobs.css']
})
export class SearchJobsComponent implements OnInit {
  allJobs: any[] = [];
  filteredJobs: any[] = [];
  searchTerm: string = '';
  selectedJob: any = null;
  token: string | null = null;
  showModal: boolean = false;
  showDomainWarning: boolean = false;
  loadingJobs: boolean = false;

  filters = {
    type: '',
    experience: '',
    expectedSalary: ''
  };

  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  // ✅ ConfirmComponent state
  confirmMessage: string = '';
  showConfirm: boolean = false;
  pendingJobApplication: any = null;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit() {
    this.searchJobs();
    this.token = this.authService.getToken();
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getStoredUser() {
    if (this.isBrowser()) {
      return this.authService.getUser();
    }
    return null;
  }

  searchJobs() {
    const user = this.getStoredUser();
    if (!user) {
      console.warn('User not found in localStorage');
      return;
    }

    this.loadingJobs = true;
    const hasFilters = this.filters.type || this.filters.experience || this.filters.expectedSalary;
    const hasSearch = this.searchTerm.trim().length > 0;
    const hasPreferredDomain = user.preferredDomain?.trim().length > 0;

    if (!hasFilters && !hasSearch && !hasPreferredDomain) {
      this.showDomainWarning = true;

      this.jobService.searchJobs().subscribe({
        next: (res: any) => {
          this.allJobs = res;
          this.filteredJobs = [...res];
          this.loadingJobs = false;
        },
        error: (err) => {
          console.error('Error fetching all jobs:', err);
          this.loadingJobs = false;
        }
      });

      return;
    }

    this.showDomainWarning = false;

    const queryParams: any = {
      userId: user._id,
      search: this.searchTerm.trim()
    };

    if (user.preferredDomain && user.preferredDomain !== 'null') {
      queryParams.domain = user.preferredDomain;
    }

    if (this.filters.type) queryParams.type = this.filters.type;
    if (this.filters.experience) queryParams.experience = this.filters.experience;
    if (this.filters.expectedSalary) queryParams.expectedSalary = this.filters.expectedSalary;

    const queryString = new URLSearchParams(queryParams).toString();

    this.jobService.searchJobsWithFilter(queryString).subscribe({
      next: (res: any) => {
        this.allJobs = res;
        this.filteredJobs = [...res];
        this.loadingJobs = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.loadingJobs = false;
      }
    });
  }

  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
  }

  closeModal() {
    this.selectedJob = null;
    this.showModal = false;
  }

  // ✅ Updated to handle confirm component logic
  applyToJob(job: any) {
    const user = this.getStoredUser();
    if (!user) {
      this.showCustomAlert('Please log in to apply.', 'info');
      return;
    }

    if (!user?.name?.trim() || !user?.email?.trim() || !user?.resume?.data) {
      this.showCustomAlert('Please complete your profile (name, email, and resume are required) before applying.', 'info');
      return;
    }

    const recommendedFields = ['phone', 'address', 'experience', 'preferredDomain'];
    const missingFields = recommendedFields.filter(field => !user[field]);

    if (missingFields.length > 0) {
      this.confirmMessage = `Your profile is missing recommended info (${missingFields.join(', ')}). Apply anyway?`;
      this.pendingJobApplication = job;
      this.showConfirm = true;
      return;
    }

    this.submitApplication(job);
  }

  // ✅ Called if user accepts confirm modal
  onConfirmApply() {
    if (this.pendingJobApplication) {
      this.submitApplication(this.pendingJobApplication);
      this.resetConfirmState();
    }
  }

  // ✅ Called if user cancels confirm modal
  onCancelConfirm() {
    this.resetConfirmState();
    this.closeModal();
  }

  private resetConfirmState() {
    this.showConfirm = false;
    this.confirmMessage = '';
    this.pendingJobApplication = null;
  }

  private submitApplication(job: any) {
    const user = this.getStoredUser();
    if (!user || !this.token) return;

    const payload = {
      userId: user._id,
      jobId: job._id
    };

    this.applicationService.applyForJob(payload, this.token).subscribe({
      next: (res: any) => {
        this.showCustomAlert(res.message || 'Application submitted!', 'success');
        this.closeModal();
        this.searchJobs();
      },
      error: (err) => {
        if (err.status === 409) {
          this.showCustomAlert('You have already applied to this job.', 'info');
        } else {
          console.error('Application error:', err);
          this.showCustomAlert('Failed to apply.', 'error');
        }
        this.closeModal();
      }
    });
  }

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info', navigate: boolean = false) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  onAlertClosed(): void {
    this.showAlert = false;
  }
}
