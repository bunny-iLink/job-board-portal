import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  constructor(private http: HttpClient) { }

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

    this.http.get(`http://localhost:3000/api/getEmployerData/${this.employerId}`).subscribe({
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
    if (!this.employerId) return;

    this.http.get<JobSummary[]>(`http://localhost:3000/api/employer/${this.employerId}/jobs-summary`).subscribe({
      next: res => {
        this.jobs = res;
        console.log('Jobs with applicant count:', this.jobs);
      },
      error: err => {
        console.error('Failed to load job summaries:', err);
      }
    });
  }

}
