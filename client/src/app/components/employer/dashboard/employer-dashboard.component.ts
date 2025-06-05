import { AfterViewInit, Component, OnInit } from '@angular/core';
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
  jobListings: any[] = [];
  employerId: string | null =null;
  newJob: any = {
    title: '',
    domain: '',
    description: {
      overview: '',
      responsibilities: [],
      requiredSkills: [],
      preferredSkills: [],
      whatWeOffer: []
    },
    company: '',
    location: '',
    salary: '',
    type: '',
    experience: '',
    vacancies: '',
    status: 'open'
  };
  constructor(private http: HttpClient) {}

  addJob() {
    if (!this.employerId || !this.employer) {
      console.warn('Employer not loaded or invalid');
      return;
    }

    const payload = {
      ...this.newJob,
      employerId: this.employerId,
      employerName: this.employer.name,
    };

    this.http.post('http://localhost:3000/api/employer/addJob', payload).subscribe({
      next: () => {
        alert('Job added successfully!');
        this.loadJobListings(); // Refresh the list
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to add job:', err);
        alert('Failed to add job');
      }
    });
  }
   resetForm() {
    this.newJob = {
      title: '',
      domain: '',
      description: {
        overview: '',
        responsibilities: [],
        requiredSkills: [],
        preferredSkills: [],
        whatWeOffer: []
      },
      company: '',
      location: '',
      salary: '',
      type: '',
      experience: '',
      vacancies: '',
      status: 'open'
    };
  }

  


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
