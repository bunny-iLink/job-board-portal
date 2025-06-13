// Angular component for searching and filtering available jobs
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
import { AlertComponent } from '../../alert/alert.component';

@Component({
  selector: 'app-search-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: 'search-jobs.html',
  styleUrls: ['search-jobs.css']
})
export class SearchJobsComponent implements OnInit {
  // All jobs fetched from backend
  allJobs: any[] = [];
  // Jobs filtered by search and filters
  filteredJobs: any[] = [];
  // Search term entered by user
  searchTerm: string = '';
  // Currently selected job for modal
  selectedJob: any = null;
  // Modal state
  token: string | null = null;
  showModal: boolean = false;
  showDomainWarning: boolean = false;
  loadingJobs: boolean = false;

  // Filter options for job type, experience, and expected salary
  filters = {
    type: '',
    experience: '',
    expectedSalary: '' // new field
  };

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info', navigate: boolean = false) {
    console.log("Alert Triggered:", { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  // Called when the alert is closed by the user
  onAlertClosed(): void {
    this.showAlert = false;
  }

  constructor(private jobService: JobService, private authService: AuthService, private applicationService: ApplicationService) { }

  // On component initialization, fetch and display jobs
  ngOnInit() {
    this.searchJobs();
    this.token = this.authService.getToken();
  }

  // Utility: Check if running in browser
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Utility: Get stored user from localStorage
  getStoredUser() {
    if (this.isBrowser()) {
      return this.authService.getUser(); // ✅ Already parsed
    }
    return null;
  }


  searchJobs() {
    const user = this.getStoredUser();
    if (!user) {
      console.warn('User not found in localStorage');
      return;
    }

    this.loadingJobs = true; // ✅ Start loading
    const hasFilters = this.filters.type || this.filters.experience || this.filters.expectedSalary;
    const hasSearch = this.searchTerm.trim().length > 0;
    const hasPreferredDomain = user.preferredDomain?.trim().length > 0;

    if (!hasFilters && !hasSearch && !hasPreferredDomain) {
      this.showDomainWarning = true;

      this.jobService.searchJobs()
        .subscribe({
          next: (res: any) => {
            this.allJobs = res;
            this.filteredJobs = [...res];
            this.loadingJobs = false; // ✅ Stop loading
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
      domain: user.preferredDomain,
      search: this.searchTerm.trim()
    };

    if (this.filters.type) queryParams.type = this.filters.type;
    if (this.filters.experience) queryParams.experience = this.filters.experience;
    if (this.filters.expectedSalary) queryParams.expectedSalary = this.filters.expectedSalary;

    const queryString = new URLSearchParams(queryParams).toString();

    this.jobService.searchJobsWithFilter(queryString)
      .subscribe({
        next: (res: any) => {
          this.allJobs = res;
          this.filteredJobs = [...res];
          this.loadingJobs = false; // ✅ Stop loading
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

  applyToJob(job: any) {
    const user = this.getStoredUser();
    if (!user) {
      this.showCustomAlert('Please log in to apply.', 'info');
      return;
    }

    // Check if profile is complete
    if (!this.isProfileComplete(user)) {
      this.showCustomAlert('Please complete your profile (name, email, and resume are required) before applying for jobs.', 'info');
      return;
    }

    const payload = {
      userId: user._id,
      jobId: job._id
    };

    this.applicationService.applyForJob(payload, this.token!).subscribe({
      next: (res: any) => {
        this.showCustomAlert(res.message || 'Application submitted!', 'success');
        this.closeModal();
        this.searchJobs();
      },
      error: (err) => {
        if (err.status === 409) {
          this.showCustomAlert('Already applied to this job.', 'info');
        } else {
          console.error('Application error:', err);
          this.showCustomAlert('Failed to apply.', 'error');
        }
        this.closeModal();
      }
    });
  }

  // Add this new method to check profile completeness
  isProfileComplete(user: any): boolean {
    // Check basic info
    if (!user?.name?.trim() || !user?.email?.trim()) {
      return false;
    }

    // Check resume exists and has data
    if (!user?.resume?.data) {
      return false;
    }

    // Optionally check other important fields
    const recommendedFields = ['phone', 'address', 'experience', 'preferredDomain'];
    for (const field of recommendedFields) {
      if (!user[field]) {
        if (confirm('Your profile is missing some recommended information. Apply anyway?')) {
          return true;
        }
        return false;
      }
    }

    return true;
  }
}
