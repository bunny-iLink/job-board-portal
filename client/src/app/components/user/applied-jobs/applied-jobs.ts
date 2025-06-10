import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-applied-jobs',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './applied-jobs.html',
  styleUrls: ['./applied-jobs.css']
})
export class AppliedJobsComponent implements OnInit {
  user: any = null;
  savedJobs: any[] = [];
  appliedJobs: any[] = [];
  userId: string | null = null;

  selectedJob: any = null;
  showModal: boolean = false;


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUserData();
  }

    loadUserData() {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('user');

      if (storedData && storedData !== 'null') {
        const userObject = JSON.parse(storedData); // ✅ full object
        this.userId = userObject._id;              // ✅ extract the ID

        this.http.get(`http://localhost:3000/api/getUserData/${this.userId}`).subscribe({
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
    this.http.get(`http://localhost:3000/api/appliedJobs/${this.userId}`).subscribe({
      next: (res: any) => {
        this.appliedJobs = res.jobs || res;
        console.log('Applied jobs:', this.appliedJobs);
      },
      error: err => {
        console.error('Failed to load applied jobs:', err);
      }
    });
  }

  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
    console.log('Job clicked:', job);

  }

  closeModal() {
    this.selectedJob = null;
    this.showModal = false;
  }

revokeApplication(jobId: string) {
  if (!this.userId || !jobId) return;

  const confirmRevoke = confirm("Are you sure you want to revoke your application for this job?");
  if (!confirmRevoke) return;

  this.http.delete(`http://localhost:3000/api/revokeApplication/${this.userId}/${jobId}`).subscribe({
    next: (res: any) => {
      alert("Application revoked successfully!");
      // Remove the job from the local array to reflect changes instantly
      this.appliedJobs = this.appliedJobs.filter(job => job._id !== jobId);
    },
    error: err => {
      console.error('Error revoking application:', err);
      alert("Failed to revoke application. Please try again.");
    }
  });
}

}
