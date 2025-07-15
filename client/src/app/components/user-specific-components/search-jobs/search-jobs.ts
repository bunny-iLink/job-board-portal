import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
import { AlertComponent } from '../../common/alert/alert.component';
import { ConfirmComponent } from '../../common/confirm/confirm.component';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-search-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ConfirmComponent],
  templateUrl: 'search-jobs.html',
  styleUrls: ['search-jobs.css'],
})
export class SearchJobsComponent implements OnInit {
  allJobs: any[] = [];
  filteredJobs: any[] = [];
  pagination = {
    total: 0,
    page: 1,
    totalPages: 1
  };
  searchTerm: string = '';
  selectedJob: any = null;
  token: string | null = null;
  showModal: boolean = false;
  showDomainWarning: boolean = false;
  loadingJobs: boolean = false;
  userId: string | null = null;
  isApplying: boolean = false;

  filters = {
    type: '',
    experience: '',
    expectedSalary: '',
  };

  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  confirmMessage: string = '';
  showConfirm: boolean = false;
  pendingJobApplication: any = null;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private applicationService: ApplicationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.searchJobs();
    this.token = this.authService.getToken();
    this.userId = this.authService.getUserId();
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

    const params: any = {
      userId: user._id,
    };

    const search = this.searchTerm.trim();
    if (search) params.search = search;

    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.experience) params.experience = this.filters.experience;
    if (this.filters.expectedSalary) params.expectedSalary = this.filters.expectedSalary;

    if (user.preferredDomain && user.preferredDomain !== 'null') {
      params.preferredDomain = user.preferredDomain;
    }

    const hasFilters = !!(params.type || params.experience || params.expectedSalary);
    const hasSearch = !!params.search;
    const hasPreferredDomain = !!params.preferredDomain;

    this.showDomainWarning = !hasFilters && !hasSearch && !hasPreferredDomain;

    this.jobService.searchJobs(params).subscribe({
      next: (res: any) => {
        this.allJobs = res.jobs || [];
        this.filteredJobs = [...this.allJobs];
        this.pagination = res.pagination || { total: 0, page: 1, totalPages: 1 };
        this.loadingJobs = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.loadingJobs = false;
      },
    });
  }

  // Add method to change page
  changePage(page: number) {
    if (page < 1 || page > this.pagination.totalPages) return;
    const user = this.getStoredUser();
    if (!user) return;
    const params: any = {
      userId: user._id,
      page: page
    };
    const search = this.searchTerm.trim();
    if (search) params.search = search;
    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.experience) params.experience = this.filters.experience;
    if (this.filters.expectedSalary) params.expectedSalary = this.filters.expectedSalary;
    if (user.preferredDomain && user.preferredDomain !== 'null') {
      params.preferredDomain = user.preferredDomain;
    }
    this.loadingJobs = true;
    this.jobService.searchJobs(params).subscribe({
      next: (res: any) => {
        this.allJobs = res.jobs || [];
        this.filteredJobs = [...this.allJobs];
        this.pagination = res.pagination || { total: 0, page: 1, totalPages: 1 };
        this.loadingJobs = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.loadingJobs = false;
      },
    });
  }

  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
  }

  closeModal() {
    this.selectedJob = null;
    this.showModal = false;
    this.isApplying = false; // Reset Apply button state
  }

  applyToJob(job: any) {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.showCustomAlert('Please log in to apply.', 'info');
      return;
    }

    if (this.isApplying) {
      this.showCustomAlert('You are already applying to a job.', 'info');
      return;
    }

    this.isApplying = true;

    this.userService.getUserData(userId).subscribe({
      next: (response: any) => {
        const user = response.user || response;

        if (!user?.name?.trim() || !user?.email?.trim() || !user?.resume) {
          this.showCustomAlert(
            'Please complete your profile (name, email, and resume are required) before applying.',
            'info'
          );
          this.isApplying = false;
          return;
        }

        const recommendedFields = ['phone', 'address', 'experience', 'preferredDomain'];
        const missingFields = recommendedFields.filter((field) => !user[field]);

        if (missingFields.length > 0) {
          this.confirmMessage = `Your profile is missing recommended info (${missingFields.join(', ')}). Apply anyway?`;
          this.pendingJobApplication = job;
          this.showConfirm = true;
          // DO NOT reset `isApplying` here — wait for confirm action
          return;
        }

        this.submitApplication(job);
      },
      error: () => {
        this.showCustomAlert('Unable to fetch user profile. Please try again.', 'error');
        this.isApplying = false;
      }
    });
  }

  onConfirmApply() {
    if (this.pendingJobApplication) {
      this.submitApplication(this.pendingJobApplication);
      this.resetConfirmState();
    }
  }

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
    if (!user || !this.token) {
      this.isApplying = false;
      return;
    }

    const payload = {
      userId: user._id,
      jobId: job._id,
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
      },
      complete: () => {
        this.isApplying = false; // reset after final step
      }
    });
  }

  private showCustomAlert(
    message: string,
    type: 'success' | 'error' | 'info',
    navigate: boolean = false
  ) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  onAlertClosed(): void {
    this.showAlert = false;
  }
}
