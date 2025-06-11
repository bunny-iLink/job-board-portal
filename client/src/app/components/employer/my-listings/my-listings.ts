import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../../environments/environment';

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
  imports: [CommonModule, FormsModule]
})
export class MyListingsComponent implements OnInit {
  // List of jobs for the employer
  jobs: Job[] = [];
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

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    // Load employer and token from localStorage and AuthService
    if (typeof window !== 'undefined') {
      const employerStr = localStorage.getItem('user');
      this.token = localStorage.getItem('token');

      if (employerStr) {
        this.employer = JSON.parse(employerStr);
      }
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

    this.http.get<Job[]>(`${this.baseUrl}/getJobs/${employerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        this.jobs = res;
        console.log('Jobs fetched:', res);
      },
      error: (err) => {
        console.error('Failed to fetch jobs:', err);
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
      this.http.put(`${this.baseUrl}/updateJob/${this.selectedJobId}`, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }).subscribe({
        next: () => {
          this.fetchJobs();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update job:', err)
      });
    } else {
      this.http.post(`${this.baseUrl}/addJob`, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }).subscribe({
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
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    this.http.delete(`${this.baseUrl}/deleteJob/${jobId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: () => this.fetchJobs(),
      error: (err) => console.error('Failed to delete job:', err)
    });
  }
}
