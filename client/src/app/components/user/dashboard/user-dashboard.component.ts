// Angular component for the user dashboard, displaying user info and applied jobs
import { AfterViewInit, Component } from '@angular/core';
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
export class UserDashboardComponent implements AfterViewInit {
  // User data object
  user: any = undefined;
  // List of jobs the user has saved (not shown in template)
  savedJobs: any[] = [];
  // List of jobs the user has applied to
  appliedJobs: any[] = [];
  // User's unique ID
  userId: string | null = null;

  loadingUserData = false;
  loadingUserAppliedJobs = false;
  hasTriedLoadingUser = false;

  constructor(private http: HttpClient) { }

  // After the view initializes, load user data from localStorage and API
  ngAfterViewInit() {
    this.loadUserData();
  }

  // Load user data from localStorage and fetch from backend
  loadUserData() {
    this.loadingUserData = true;
    this.hasTriedLoadingUser = false;
    
    if (typeof window !== 'undefined') {

      const storedData = localStorage.getItem('user');

      if (storedData && storedData !== 'null') {
        const userObject = JSON.parse(storedData);
        this.userId = userObject._id;

        this.http.get(environment.apiUrl + `/api/getUserData/${this.userId}`).subscribe({
          next: (res: any) => {
            this.user = res.user;
            this.loadingUserData = false;
            this.hasTriedLoadingUser = true;
            this.loadAppliedJobs();
          },
          error: err => {
            console.error('Failed to load user data:', err);
            this.user = null;
            this.loadingUserData = false;
            this.hasTriedLoadingUser = true;
          }
        });
      } else {
        console.warn('No valid user in localStorage.');
        this.user = null;
        this.loadingUserData = false;
        this.hasTriedLoadingUser = true;
      }
    }
  }

  // Fetch jobs the user has applied to from backend
  loadAppliedJobs() {

    this.loadingUserAppliedJobs = true;
    if (!this.userId) return;
    this.http.get(environment.apiUrl + `/api/appliedJobs/${this.userId}`).subscribe({
      next: (res: any) => {
        this.appliedJobs = res.jobs || res;
        console.log('Applied jobs:', this.appliedJobs);
        this.loadingUserAppliedJobs = false;
      },
      error: err => {
        console.error('Failed to load applied jobs:', err);
        this.loadingUserAppliedJobs = false;
      }
    });
  }
}
