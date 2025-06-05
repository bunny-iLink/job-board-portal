import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements AfterViewInit {
  user: any = null;
  savedJobs: any[] = [];
  userId: string | null = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadUserData();
  }

  loadUserData() {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('id');
      if (storedData && storedData !== 'null') {
        this.userId = JSON.parse(storedData);

        this.http.get(`http://localhost:3000/api/getUserData/${this.userId}`).subscribe({
          next: (res: any) => {
            this.user = res.user;
            console.log('User data:', this.user);
            this.loadSavedJobs(); // load jobs after user info is fetched
          },
          error: err => {
            console.error('Failed to load user data:', err);
          }
        });

      } else {
        console.warn('No valid user ID in localStorage.');
      }
    }
  }

  loadSavedJobs() {
    if (!this.userId) return;
    this.http.get(`http://localhost:3000/api/user/savedJobs/${this.userId}`).subscribe({
      next: (res: any) => {
        this.savedJobs = res.jobs || res;
        console.log('Saved jobs:', this.savedJobs);
      },
      error: err => {
        console.error('Failed to load saved jobs:', err);
      }
    });
  }
}
