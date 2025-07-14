import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { UserService } from '../../../service/user.service';
import { EmployerService } from '../../../service/employer.service';
import { JobService } from '../../../service/job.service';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  providers: [
    provideEchartsCore({ echarts: () => import('echarts') }),
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  role: 'user' | 'employer' | null = null;

  // Common
  token: string | null = null;
  isChartLoading = false;

  // User Specific
  userId: string | null = null;
  user: any = null;
  appliedJobs: any[] = [];
  userPieChartOptions: any = {};
  userBarChartOptions: any = {};
  isUserLoading = false;  
  isUserJobsLoading = false;

  totalPages: number = 1;
  currentPage: number = 1;
  // Employer Specific
  employerId: string | null = null;
  employer: any = null;
  jobs: any[] = [];
  employerPieChartOptions: any = {};
  employerBarChartOptions: any = {};
  isEmployerLoading = false;
  isEmployerJobsLoading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private employerService: EmployerService,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken();
    const userData = this.authService.getUser();

    if (!this.token || !userData) {
      console.warn('No token or user found');
      return;
    }

    this.role = userData.role; // Assumes role is stored like { role: 'user' or 'employer' }

    if (this.role === 'user') {
      this.userId = userData._id;
      this.loadUserData();
      this.loadAppliedJobs();
      this.fetchUserStatusChart();
      this.fetchUserDomainChart();
    } else if (this.role === 'employer') {
      this.employerId = userData._id;
      this.fetchEmployerData();
      this.fetchEmployerJobs();
      this.fetchEmployerBarChart();
      this.fetchEmployerPieChart();
    }
  }

  // =========================== USER LOGIC ===========================

  loadUserData() {
    this.isUserLoading = true;
    this.userService.getUserData(this.userId!).subscribe({
      next: (res) => {
        this.user = res.user;
      },
      error: (err) => console.error('User data error:', err),
      complete: () => (this.isUserLoading = false),
    });
  }
  sortByStatusOrder() {
    const statusPriority: { [key: string]: number } = {
      'Accepted': 1,
      'In Progress': 2,
      'Rejected': 3,
      'Applied': 4
    };

    this.appliedJobs.sort((a, b) => {
      return statusPriority[a.status] - statusPriority[b.status];
    });
  }


    // loadAppliedJobs() {
    //   this.isUserJobsLoading = true;
    //   this.jobService.appliedJobs(this.userId!).subscribe({
    //     next: (res) => (this.appliedJobs = res.jobs || res),
    //     error: (err) => console.error('Applied jobs error:', err),
    //     complete: () => (this.isUserJobsLoading = false),
    //   });
    // }

  loadAppliedJobs() {
    this.isUserJobsLoading = true;
    this.jobService.appliedJobs(this.userId!, this.currentPage, 5).subscribe({
      next: (res) => {
        this.appliedJobs = res.jobs || res;
        this.totalPages = res.totalPages || 1;
      },
      error: (err) => console.error('Applied jobs error:', err),
      complete: () => (this.isUserJobsLoading = false),
    });
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAppliedJobs();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAppliedJobs();
    }
  }

  fetchUserStatusChart() {
    this.isChartLoading = true;
    this.userService.getUserStatusSummary(this.userId!, this.token!).subscribe({
      next: (statusCounts) => {
        const pieData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));
        this.userPieChartOptions = {
          title: { text: 'Application Status', left: 'left' },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'right' },
          series: [{ type: 'pie', radius: '50%', data: pieData }],
        };
      },
      error: (err) => console.error('Status chart error:', err),
      complete: () => (this.isChartLoading = false),
    });
  }

  fetchUserDomainChart() {
    this.isChartLoading = true;
    this.userService.getDomainSummary(this.userId!, this.token!).subscribe({
      next: (data) => {
        this.userBarChartOptions = {
          title: { text: 'Applications by Domain', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '5%', right: '5%', bottom: '5%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: {
            type: 'category',
            data: data.map(d => d.domain),
            axisLabel: {
              formatter: (value: string) => value.length > 20 ? value.slice(0, 20) + '…' : value,
            },
          },
          series: [{
            name: 'Applications',
            type: 'bar',
            data: data.map(d => d.count),
            itemStyle: { color: '#91cc75' },
            label: { show: true, position: 'right' },
          }],
        };
      },
      error: (err) => console.error('Domain chart error:', err),
      complete: () => (this.isChartLoading = false),
    });
  }

  // =========================== EMPLOYER LOGIC ===========================

  fetchEmployerData() {
    this.isEmployerLoading = true;
    this.employerService.getEmployerData(this.employerId!, this.token!).subscribe({
      next: (res) => (this.employer = res.employer),
      error: (err) => console.error('Employer data error:', err),
      complete: () => (this.isEmployerLoading = false),
    });
  }

  fetchEmployerJobs() {
    this.isEmployerJobsLoading = true;
    this.jobService.getJobSummaries(this.employerId!, this.token!).subscribe({
      next: (res) => (this.jobs = res),
      error: (err) => console.error('Jobs error:', err),
      complete: () => (this.isEmployerJobsLoading = false),
    });
  }

  fetchEmployerBarChart() {
    this.jobService.getJobSummaries(this.employerId!, this.token!).subscribe({
      next: (jobs: any[]) => {
        this.employerBarChartOptions = {
          title: { text: 'Applications per Job', left: 'center' },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '5%', right: '5%', bottom: '5%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: {
            type: 'category',
            data: jobs.map(job => job.title),
            axisLabel: {
              formatter: (val: string) => val.length > 20 ? val.slice(0, 20) + '…' : val,
            },
          },
          series: [{
            type: 'bar',
            data: jobs.map(job => job.applicantCount),
            itemStyle: { color: '#5470C6' },
            label: { show: true, position: 'right' },
          }],
        };
      },
      error: (err) => console.error('Bar chart error:', err),
    });
  }

  fetchEmployerPieChart() {
    this.employerService.getApplicationStatusSummary(this.employerId!, this.token!).subscribe({
      next: (statusCounts: any) => {
        const pieData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));
        this.employerPieChartOptions = {
          title: { text: 'Application Status Distribution', left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{ type: 'pie', radius: '50%', data: pieData }],
        };
      },
      error: (err) => console.error('Pie chart error:', err),
    });
  }

  // Navigation (for employer job detail)
  viewJobDetails(jobId: string) {
    this.router.navigate(['/employer/job-details'], { queryParams: { id: jobId } });
  }

  addJob(){
    this.router.navigate(['/employer/my-listings'],{
      state: {openAddModal: true}
    });
  }
}
