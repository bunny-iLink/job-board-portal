import { AfterViewInit, Component, NgModule, OnInit } from '@angular/core';
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

export class EmployerDashboardComponent implements AfterViewInit {
  employer: any = null;
  employerId: string | null = null;
  token: string | null = null;

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.loadEmployerData();

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  loadEmployerData() {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('id');
      if (storedData && storedData !== 'null') {
        this.employerId = JSON.parse(storedData);

        this.http.get(`http://localhost:3000/api/getEmployerData/${this.employerId}`).subscribe({
          next: (res: any) => {
            this.employer = res.employer;
            console.log(this.employer);
          },
          error: err => {
            console.error('Failed to load employer data:', err);
          }
        });

      } else {
        console.warn('No valid employer ID in localStorage.');
      }
    }
  }
}
