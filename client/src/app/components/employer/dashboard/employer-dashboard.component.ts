// Angular component for the employer dashboard, displaying employer info and job listings
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployerService } from '../../../service/employer.service';
import { JobService } from '../../../service/job.service';
import { AuthService } from '../../../service/auth.service';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';


@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
    providers: [
    provideEchartsCore({
      echarts: () => import('echarts')
    })
  ],
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
  lineChartOptions: any = {};
  pieChartOptions: any = {};

// Loading states for various data fetches
  isChartLoading = false;
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
      this.fetchLineChartData();
      this.fetchPieChartData();
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
  fetchLineChartData() {
    if (!this.employerId || !this.token) return;

    this.isChartLoading = true;

    this.jobService.getJobSummaries(this.employerId, this.token).subscribe({
      next: (jobs: any[]) => {
        const titles = jobs.map(job => job.title);
        const applicationCounts = jobs.map(job => job.applicantCount);

        this.lineChartOptions = {
          title: { text: 'Applications per Job Title' },
          tooltip: {},
          xAxis: {
            type: 'category',
            data: titles,
            axisLabel: { rotate: 30 }
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Applications',
              type: 'line',
              data: applicationCounts
            }
          ]
        };
      },
      error: err => console.error('Error loading line chart data:', err),
      complete: () => this.isChartLoading = false
    });
  }

  fetchPieChartData() {
  if (!this.employerId || !this.token) return;

  this.employerService.getApplicationStatusSummary(this.employerId, this.token).subscribe({
    next: (statusCounts: any) => {
      const pieData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      }));

      this.pieChartOptions = {
        title: { text: 'Application Status Distribution', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: 'Applications',
            type: 'pie',
            radius: '50%',
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    },
    error: err => console.error('Error loading pie chart data:', err),
    complete: () => this.isChartLoading = false
  });
}


}
