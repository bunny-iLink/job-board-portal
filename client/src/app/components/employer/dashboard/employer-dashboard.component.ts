import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

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
  employer: any = null;
  employerId: string | null = null;
  token: string | null = null;
  jobs: JobSummary[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.employerId = user._id;

        this.fetchEmployerData();
        this.fetchJobSummaries();
      } else {
        console.warn("No valid employer");
      }
    }
  }

  fetchEmployerData() {
    if (!this.employerId) return;

    this.http.get(environment.apiUrl + `/api/getEmployerData/${this.employerId}`).subscribe({
      next: (res: any) => {
        this.employer = res.employer;
        console.log('Employer loaded:', this.employer);
      },
      error: err => {
        console.error('Failed to load employer data:', err);
      }
    });
  }

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


  viewJobDetails(jobId: string) {
    this.router.navigate(['employer//job', jobId]); // redirects to /job/:id
  }

}
