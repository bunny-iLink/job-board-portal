// Angular component for the user dashboard, displaying user info and applied jobs
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { UserService } from '../../../service/user.service';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  providers: [
    provideEchartsCore({ echarts: () => import('echarts') }) // 👈 REQUIRED
  ],
  templateUrl: 'user-dashboard.component.html',
  styleUrls: ['user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  // User data object
  user: any = undefined;
  // List of jobs the user has saved (not shown in template)
  savedJobs: any[] = [];
  // List of jobs the user has applied to
  appliedJobs: any[] = [];
  // User's unique ID
  userId: string | null = null;
  token: string | null = null;

  pieChartOptions: any = {};
  barChartOptions: any = {};
  isChartLoading = false;

  isUserLoading = false;
  isJobsLoading = false;

  constructor(private userService: UserService, private authService: AuthService, private jobService: JobService) { }

  // After the view initializes, load user data from localStorage and API
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.token = this.authService.getToken();

      const storedUser = this.authService.getUser();
      if (storedUser) {
        this.userId = storedUser._id;
        this.token = this.authService.getToken();

        if (this.userId && this.token) {
          this.loadUserData();
          this.loadAppliedJobs();
          this.fetchStatusChart();
          this.fetchDomainChart();
        }
      } else {
        console.warn("No valid employer");
      }
    }
  }

  // Load user data from localStorage and fetch from backend
  loadUserData() {
    if (typeof window !== 'undefined') {

      const storedData = this.authService.getUser();;

      if (storedData && storedData !== 'null') {
        this.userId = storedData._id;

        this.isUserLoading = true;
        this.userService.getUserData(this.userId!).subscribe({
          next: (res: any) => {
            this.user = res.user;
            this.isUserLoading = false;
            // this.loadAppliedJobs();
          },
          error: err => {
            console.error('Failed to load user data:', err);
            this.user = null;
            this.isUserLoading = false;
          }
        });
      } else {
        console.warn('No valid user in localStorage.');
        this.user = null;
        this.isUserLoading = false;
      }
    }
  }

  // Fetch jobs the user has applied to from backend
  loadAppliedJobs() {
    if (!this.userId) return;

    this.isJobsLoading = true;
    this.jobService.appliedJobs(this.userId).subscribe({
      next: (res: any) => {
        this.appliedJobs = res.jobs || res;
        console.log('Applied jobs:', this.appliedJobs);
        this.isJobsLoading = false;
      },
      error: err => {
        console.error('Failed to load applied jobs:', err);
        this.isJobsLoading = false;
      }
    });
  }

  fetchStatusChart() {
  this.isChartLoading = true;

  this.userService.getUserStatusSummary(this.userId!, this.token!).subscribe({
    next: (statusCounts: any) => {
      const pieData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count
      }));

      this.pieChartOptions = {
        title: { text: 'Application Status', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          name: 'Applications',
          type: 'pie',
          radius: '50%',
          data: pieData
        }]
      };
    },
    complete: () => this.isChartLoading = false,
    error: err => console.error('Status chart error:', err)
  });
}

fetchDomainChart() {
  this.isChartLoading = true;

  this.userService.getDomainSummary(this.userId!, this.token!).subscribe({
    next: (domainData: any[]) => {
      const domains = domainData.map(d => d.domain);  // ✅ FIXED here
      const counts = domainData.map(d => d.count);     // e.g. 4

      this.barChartOptions = {
        title: { text: 'Applications by Job Domain' },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: domains
        },
        yAxis: { type: 'value' },
        series: [{
          data: counts,
          type: 'bar'
        }]
      };
    },
    complete: () => this.isChartLoading = false,
    error: err => console.error('Domain chart error:', err)
  });
}

}
