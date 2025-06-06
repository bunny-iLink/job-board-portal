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
  userId: string | null = null;
  token: string | null = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadUserData();

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
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
}
