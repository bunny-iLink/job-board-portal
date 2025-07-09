import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
import { AlertComponent } from '../../alert/alert.component';
import { ConfirmComponent } from '../../confirm/confirm.component';
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
  searchTerm: string = '';
  selectedJob: any = null;
  token: string | null = null;
  showModal: boolean = false;
  showDomainWarning: boolean = false;
  loadingJobs: boolean = false;
  userId: string | null = null;

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
        this.allJobs = res;
        this.filteredJobs = [...res];
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
  }

  applyToJob(job: any) {
    const userId = this.authService.getUserId(); // or however you retrieve userId

    if (!userId) {
      this.showCustomAlert('Please log in to apply.', 'info');
      return;
    }

    this.userService.getUserData(userId).subscribe({
      next: (response: any) => {
        const user = response.user || response; // depending on your API structure

        if (!user?.name?.trim() || !user?.email?.trim() || !user?.resume) {
          this.showCustomAlert(
            'Please complete your profile (name, email, and resume are required) before applying.',
            'info'
          );
          return;
        }

        const recommendedFields = ['phone', 'address', 'experience', 'preferredDomain'];
        const missingFields = recommendedFields.filter((field) => !user[field]);

        if (missingFields.length > 0) {
          this.confirmMessage = `Your profile is missing recommended info (${missingFields.join(', ')}). Apply anyway?`;
          this.pendingJobApplication = job;
          this.showConfirm = true;
          return;
        }

        this.submitApplication(job);
      },
      error: () => {
        this.showCustomAlert('Unable to fetch user profile. Please try again.', 'error');
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
    if (!user || !this.token) return;

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
