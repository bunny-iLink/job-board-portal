import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { environment } from '../../../environments/environment';
import { JobService } from '../../../service/job.service';
import { ConfirmComponent } from '../../confirm/confirm.component';

interface Job {
  _id?: string;
  title: string;
  employerId: string;
  employerName: string;
  domain: string;
  description: {
    overview: string;
    responsibilities: string[];
    requiredSkills: string[];
    preferredSkills?: string[];
    whatWeOffer?: string[];
  };
  company: string;
  location: string;
  salary: number;
  type: string;
  experience: string;
  vacancies: number;
  status?: string;
}

// Angular component for managing the employer's job listings (CRUD operations)
@Component({
  selector: 'app-my-listings',
  templateUrl: 'my-listings.html',
  styleUrls: ['./my-listings.css'],
  imports: [CommonModule, FormsModule, ConfirmComponent]
})
export class MyListingsComponent implements OnInit {
  // List of jobs for the employer
  jobs: any = [];
  // Modal state for add/edit job
  isModalOpen = false;
  // Edit mode flag
  isEditMode = false;
  // Currently selected job ID for editing
  selectedJobId: string | null = null;
  // Employer ID and profile
  employerId!: string;
  employer: any;
  // JWT token for authentication
  token: string | null = null;
  // Form model for job creation/editing
  jobForm: Job = this.getEmptyJob();
  // API base URL
  readonly baseUrl = environment.apiUrl + '/api';

  // Variables for Confirm
  confirmMessage: string = ""
  showConfirm: boolean = false;
  jobIdToDelete: string = "";

  private showCustomConfirm(message: string) {
    this.confirmMessage = message;
    this.showConfirm = true;
  }

  loading = false;

  constructor(private http: HttpClient, private authService: AuthService, private jobService: JobService) { }

  ngOnInit() {
    // Load employer and token from localStorage via AuthService
    if (typeof window !== 'undefined') {
      this.employer = this.authService.getUser(); // already parsed JSON
      this.token = this.authService.getToken();
    }

    this.employerId = this.authService.getUserId() ?? '';
    console.log('Employer ID from AuthService:', this.employerId);
    console.log('Token:', this.token);

    this.fetchJobs();
  }


  // Returns a blank job object for form reset
  getEmptyJob(): Job {
    return {
      title: '',
      employerId: this.employerId,
      employerName: '',
      domain: '',
      description: {
        overview: '',
        responsibilities: [],
        requiredSkills: [],
        preferredSkills: [],
        whatWeOffer: [],
      },
      company: '',
      location: '',
      salary: null as any,
      type: '',
      experience: '',
      vacancies: null as any,
      status: 'open'
    };
  }

  // Fetch all jobs for the current employer from backend
  fetchJobs() {
    const token = this.token;
    const employerId = this.employerId;

    if (!employerId || !token) {
      console.warn('Cannot fetch jobs: employerId or token is missing');
      return;
    }

    this.loading = true;

    this.jobService.getJobs(this.employerId, this.token!).subscribe({
      next: (res) => {
        this.jobs = res;
        console.log('Jobs fetched:', res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch jobs:', err);
        this.loading = false;
      }
    });
  }

  // Open the modal for adding or editing a job
  openModal(job?: Job) {
    this.isModalOpen = true;
    this.isEditMode = !!job;

    if (job) {
      this.selectedJobId = job._id || null;
      this.jobForm = JSON.parse(JSON.stringify(job));
    } else {
      this.selectedJobId = null;
      this.jobForm = this.getEmptyJob();

      if (this.employer) {
        this.jobForm.employerId = this.employer._id;
        this.jobForm.employerName = this.employer.name;
        this.jobForm.company = this.employer.company;
      }
    }
  }

  // Close the job modal and reset the form
  closeModal() {
    this.isModalOpen = false;
    this.jobForm = this.getEmptyJob();
  }

  // Convert comma-separated string to array for form fields
  toArray(str: string): string[] {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Convert array to comma-separated string for form fields
  fromArray(arr?: string[]): string {
    return arr?.join(', ') ?? '';
  }

  // Save a new job or update an existing job
  saveJob() {
    const payload = {
      ...this.jobForm,
      description: {
        ...this.jobForm.description,
        preferredSkills: this.jobForm.description.preferredSkills || [],
        whatWeOffer: this.jobForm.description.whatWeOffer || [],
      }
    };

    if (this.isEditMode && this.selectedJobId) {
      this.jobService.updateJob(this.selectedJobId, payload, this.token!).subscribe({
        next: () => {
          this.fetchJobs();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update job:', err)
      });
    } else {
      this.jobService.addJob(payload, this.token!).subscribe({
        next: () => {
          this.fetchJobs();
          this.closeModal();
        },
        error: (err) => console.error('Failed to add job:', err)
      });
    }
  }

  // Delete a job after confirmation
  deleteJob(jobId: string) {
    this.jobIdToDelete = jobId;
    this.showCustomConfirm('Are you sure you want to delete this job? This action cannot be undone.')
  }

  onConfirmDelete() {
    this.jobService.deleteJob(this.jobIdToDelete!, this.token!).subscribe({
      next: () => this.fetchJobs(),
      error: (err) => console.error('Failed to delete job:', err)
    });
    this.showConfirm = false;
  }

  onCancelConfirm() {
    this.showConfirm = false;
  }
}
