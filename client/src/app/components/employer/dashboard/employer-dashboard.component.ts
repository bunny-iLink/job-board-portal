// Angular component for the employer dashboard, displaying employer info and job listings
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

// Interface for job summary data
interface JobSummary {
  _id: string;
  title: string;
  vacancies: number;
  applicantCount: number;
}

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.css']
})
export class EmployerDashboardComponent implements OnInit {
  // Employer data object
  employer: any = null;
  // Employer's unique ID
  employerId: string | null = null;
  // JWT token for authentication
  token: string | null = null;
  // List of job summaries for this employer
  jobs: JobSummary[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  // On component initialization, load employer and job data from localStorage and API
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.employerId = user._id;

        this.fetchEmployerData(); // Load employer profile
        this.fetchJobSummaries(); // Load job listings
      } else {
        console.warn("No valid employer");
      }
    }
  }

  // Fetch employer profile data from backend
  fetchEmployerData() {
    if (!this.employerId) return;

    this.http.get(environment.apiUrl + `/api/getEmployerData/${this.employerId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (res: any) => {
        this.employer = res.employer;
        console.log('Employer loaded:', this.employer);
      },
      error: err => {
        console.error('Failed to load employer data:', err);
      }
    });
  }

  // Fetch job summaries for this employer from backend
  fetchJobSummaries() {
    if (!this.employerId || !this.token) {
      console.warn('Cannot fetch job summaries: employerId or token missing');
      return;
    }

    this.http.get<JobSummary[]>(
      environment.apiUrl + `/api/employer/${this.employerId}/jobs-summary`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: res => {
        this.jobs = res;
        console.log('Jobs with applicant count:', this.jobs);
      },
      error: err => {
        console.error('Failed to load job summaries:', err);
      }
    });
  }

  // Navigate to job details page for a specific job
  viewJobDetails(jobId: string) {
    this.router.navigate(['/employer/job-details', jobId]);
  }
}
