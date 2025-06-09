import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'search-jobs.html',
  styleUrls: ['search-jobs.css']
})
export class SearchJobsComponent implements OnInit {
  allJobs: any[] = [];
  filteredJobs: any[] = [];
  searchTerm: string = '';
  selectedJob: any = null;
  showModal: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'null') {
      const user = JSON.parse(storedUser);
      const preferredDomain = user.preferredDomain;
      const userId = user._id;

      if (preferredDomain && userId) {
        this.http
          .get(`http://localhost:3000/api/jobs-by-domain?domain=${encodeURIComponent(preferredDomain)}&userId=${userId}`)
          .subscribe({
            next: (res: any) => {
              this.allJobs = res;
              this.filteredJobs = [...res];
            },
            error: err => {
              console.error('Failed to fetch jobs:', err);
            }
          });
      } else {
        console.warn('Preferred domain or user ID not found in user data.');
      }
    } else {
      console.warn('No user data in localStorage.');
    }
  }



  searchJobs() {
    const term = this.searchTerm.toLowerCase();
    this.filteredJobs = this.allJobs.filter(job =>
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term)
    );
  }

  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedJob = null;
  }

  applyToJob(job: any) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'null') {
      alert('User not found. Please log in again.');
      return;
    }

    const user = JSON.parse(storedUser);
    const payload = {
      userId: user._id,
      jobId: job._id
    };

    this.http.post('http://localhost:3000/api/applyForJob', payload)
      .subscribe({
        next: (res: any) => {
          alert(res.message || 'Application submitted successfully!');
          this.closeModal();
          this.loadJobs(); // refresh list to hide applied job
        },
        error: err => {
          if (err.status === 409) {
            alert('You have already applied for this job.');
          } else {
            console.error('Error applying for job:', err);
            alert('Something went wrong while applying. Please try again.');
          }
          this.closeModal();
        }
      });
  }

}
