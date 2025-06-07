import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.employerId = user._id;

        this.http.get(`http://localhost:3000/api/getEmployerData/${this.employerId}`).subscribe({
          next: (res: any) => {
            this.employer = res.employer;
            console.log('Employer loaded:', this.employer);
          },
          error: err => {
            console.error('Failed to load employer data:', err);
          }
        });
      } else {
        console.warn('No valid employer');
      }
    }
  }
}
