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

@Component({
  selector: 'app-my-listings',
  templateUrl: 'my-listings.html',
  styleUrls: ['./my-listings.css'],
  imports: [CommonModule, FormsModule]
})
export class MyListingsComponent implements OnInit {
  constructor(private http: HttpClient, private authService: AuthService) { }

  jobs: Job[] = [];
  isModalOpen = false;
  isEditMode = false;
  selectedJobId: string | null = null;
  employerId!: string;
  employer: any;
  token: string | null = null;

  jobForm: Job = this.getEmptyJob();
  readonly baseUrl = environment.apiUrl + '/api';

  ngOnInit() {
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

  closeModal() {
    this.isModalOpen = false;
    this.jobForm = this.getEmptyJob();
  }

  toArray(str: string): string[] {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  fromArray(arr?: string[]): string {
    return arr?.join(', ') ?? '';
  }

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
      this.http.put(`${this.baseUrl}/updateJob/${this.selectedJobId}`, payload).subscribe({
        next: () => {
          this.fetchJobs();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update job:', err)
      });
    } else {
      this.http.post(`${this.baseUrl}/addJob`, payload).subscribe({
        next: () => {
          this.fetchJobs();
          this.closeModal();
        },
        error: (err) => console.error('Failed to add job:', err)
      });
    }
  }

  deleteJob(jobId: string) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    this.http.delete(`${this.baseUrl}/deleteJob/${jobId}`).subscribe({
      next: () => this.fetchJobs(),
      error: (err) => console.error('Failed to delete job:', err)
    });
  }
}
