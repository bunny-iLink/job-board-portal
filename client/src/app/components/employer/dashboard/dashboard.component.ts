import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class Dashboard implements AfterViewInit {
  employer: any = null;
  jobListings: any[] = [];
  employerId: string | null =null;

  constructor(private http: HttpClient) {}


  ngAfterViewInit() {
  this.loadEmployerData();
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


  loadJobListings() {
    // Replace with actual API endpoint
    this.http.get('http://localhost:3000/api/employer/listings').subscribe({
      next: (res: any) => {
        this.jobListings = res.jobs || res; // Adjust depending on API shape
      },
      error: err => {
        console.error('Failed to load listings:', err);
      }
    });
  }
}
