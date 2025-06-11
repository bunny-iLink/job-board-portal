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
  user: any = null;
  // List of jobs the user has saved (not shown in template)
  savedJobs: any[] = [];
  // List of jobs the user has applied to
  appliedJobs: any[] = [];
  // User's unique ID
  userId: string | null = null;

  constructor(private http: HttpClient) { }

  // After the view initializes, load user data from localStorage and API
  ngAfterViewInit() {
    this.loadUserData();
  }

  // Load user data from localStorage and fetch from backend
  loadUserData() {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('user');

      if (storedData && storedData !== 'null') {
        const userObject = JSON.parse(storedData); // Parse user object
        this.userId = userObject._id;              // Extract user ID

        // Fetch user profile from backend
        this.http.get(environment.apiUrl +`/api/getUserData/${this.userId}`).subscribe({
          next: (res: any) => {
            this.user = res.user;

            console.log('User data:', this.user);
            this.loadAppliedJobs(); // Load jobs the user has applied to
          },
          error: err => {
            console.error('Failed to load user data:', err);
          }
        });
      } else {
        console.warn('No valid user in localStorage.');
      }
    }
  }

  // Fetch jobs the user has applied to from backend
  loadAppliedJobs() {

    if (!this.userId) return;
    this.http.get(environment.apiUrl +`/api/appliedJobs/${this.userId}`).subscribe({
      next: (res: any) => {
        this.appliedJobs = res.jobs || res;
        console.log('Applied jobs:', this.appliedJobs);
      },
      error: err => {
        console.error('Failed to load applied jobs:', err);
      }
    });
  }
}
