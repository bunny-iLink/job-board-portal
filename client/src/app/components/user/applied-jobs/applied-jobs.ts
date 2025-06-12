// Angular component for displaying jobs the user has applied to
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-applied-jobs',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './applied-jobs.html',
  styleUrls: ['./applied-jobs.css']
})
export class AppliedJobsComponent implements OnInit {
  // User profile data
  user: any = null;
  // List of jobs the user has saved (not shown in template)
  savedJobs: any[] = [];
  // List of jobs the user has applied to
  appliedJobs: any[] = [];
  // User's unique ID
  userId: string | null = null;
  token: string | null = null;
  // Modal state and selected job for details
  selectedJob: any = null;
  showModal: boolean = false;
  loading: boolean = true; 

  constructor(private http: HttpClient, private authService: AuthService) { }

  // On component initialization, load user and applied jobs data
  ngOnInit(): void {
    this.loadUserData();
    this.token = this.authService.getToken();
  }

  // Load user data from localStorage and fetch from backend
  loadUserData() {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('user');

      if (storedData && storedData !== 'null') {
        const userObject = JSON.parse(storedData); // Parse user object
        this.userId = userObject._id;              // Extract user ID

        // Fetch user profile from backend
        this.http.get(environment.apiUrl + `/api/getUserData/${this.userId}`).subscribe({
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
  // Load jobs that the user has applied to from the backend
  loadAppliedJobs() {
    if (!this.userId) return;

    this.loading = true; // Start loading

    this.http.get(environment.apiUrl + `/api/appliedJobs/${this.userId}`).subscribe({
      next: (res: any) => {
        this.appliedJobs = res.jobs || res;
        console.log('Applied jobs:', this.appliedJobs);
        this.loading = false; // Stop loading on success
      },
      error: err => {
        console.error('Failed to load applied jobs:', err);
        this.loading = false; // Stop loading on error
      }
    });
  }


  // Open the modal to show job details
  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
    console.log('Job clicked:', job);

  }

  // Close the job details modal
  closeModal() {
    this.selectedJob = null;
    this.showModal = false;
  }

  // Revoke an application for a job
  revokeApplication(jobId: string) {
    if (!jobId) return;

    // Find the application to get the applicationId
    const application = this.appliedJobs.find(job => job._id === jobId);
    if (!application) {
      alert("Application not found!");
      return;
    }

    const confirmRevoke = confirm("Are you sure you want to revoke your application for this job?");
    if (!confirmRevoke) return;

    this.http.delete(environment.apiUrl + `/api/revokeApplication/${application.applicationId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (res: any) => {
        alert("Application revoked successfully!");
        this.appliedJobs = this.appliedJobs.filter(job => job._id !== jobId);
      },
      error: err => {
        console.error('Error revoking application:', err);
        alert(`Failed to revoke application: ${err.error?.message || 'Unknown error'}`);
      }
    });
  }

}
