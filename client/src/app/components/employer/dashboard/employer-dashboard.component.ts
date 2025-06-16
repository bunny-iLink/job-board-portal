// Angular component for the employer dashboard, displaying employer info and job listings
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployerService } from '../../../service/employer.service';
import { JobService } from '../../../service/job.service';
import { AuthService } from '../../../service/auth.service';

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
  jobs: any = [];

  isEmployerLoading = false;
  isJobsLoading = false;

  constructor(private jobService: JobService, private employerService: EmployerService, private authService: AuthService, private router: Router) { }

  // On component initialization, load employer and job data from localStorage and API
  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.employerId = this.authService.getUserId();

    if (this.token && this.employerId) {
      this.fetchEmployerData();
      this.fetchJobSummaries();
    } else {
      console.warn('Missing token or employer ID.');
    }
  }

  // Fetch employer profile data from backend
  fetchEmployerData(): void {
    if (!this.employerId || !this.token) return;

    this.isEmployerLoading = true;
    this.employerService.getEmployerData(this.employerId, this.token).subscribe({
      next: (res: any) => {
        this.employer = res.employer;
        console.log('Employer loaded:', this.employer);
      },
      error: err => {
        console.error('Failed to load employer data:', err);
      },
      complete: () => {
        this.isEmployerLoading = false;
      }
    });
  }

  // Fetch job summaries for this employer from backend
  fetchJobSummaries(): void {
    if (!this.employerId || !this.token) return;

    this.isJobsLoading = true;
    this.jobService.getJobSummaries(this.employerId, this.token).subscribe({
      next: (res: any[]) => {
        this.jobs = res;
        console.log('Jobs loaded:', this.jobs);
      },
      error: err => {
        console.error('Failed to load job summaries:', err);
      },
      complete: () => {
        this.isJobsLoading = false;
      }
    });
  }

  // Navigate to job details page for a specific job
  viewJobDetails(jobId: string) {
    this.router.navigate(['/employer/job-details'], {
      queryParams: { id: jobId }
    });
  }
}
