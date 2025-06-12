// Angular component for the user dashboard, displaying user info and applied jobs
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
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
  isUserLoading = false;
  isJobsLoading = false;

  constructor(private http: HttpClient) { }

  // After the view initializes, load user data from localStorage and API
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.userId = user._id;

        this.loadUserData(); // Load employer profile
        this.loadAppliedJobs(); // Load job listings
      } else {
        console.warn("No valid employer");
      }
    }
  }

  // Load user data from localStorage and fetch from backend
  loadUserData() {
    if (typeof window !== 'undefined') {

      const storedData = localStorage.getItem('user');

      if (storedData && storedData !== 'null') {
        const userObject = JSON.parse(storedData);
        this.userId = userObject._id;

        this.isUserLoading = true;
        this.http.get(environment.apiUrl + `/api/getUserData/${this.userId}`).subscribe({
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
    this.http.get(environment.apiUrl + `/api/appliedJobs/${this.userId}`).subscribe({
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
}
