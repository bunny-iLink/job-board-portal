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
  user: any = null;
  savedJobs: any[] = [];
  appliedJobs: any[] = [];
  userId: string | null = null;

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.loadUserData();
  }

  loadUserData() {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('user');

      if (storedData && storedData !== 'null') {
        const userObject = JSON.parse(storedData); // ✅ full object
        this.userId = userObject._id;              // ✅ extract the ID

        this.http.get(environment.apiUrl +`/api/getUserData/${this.userId}`).subscribe({
          next: (res: any) => {
            this.user = res.user;

            console.log('User data:', this.user);
            this.loadAppliedJobs();
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
