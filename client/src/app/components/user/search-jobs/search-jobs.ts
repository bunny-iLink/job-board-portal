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

      if (preferredDomain) {
        this.http
          .get(`http://localhost:3000/api/jobs-by-domain?domain=${encodeURIComponent(preferredDomain)}`)
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
        console.warn('Preferred domain not found in user data.');
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
    alert(`Applied to ${job.title} at ${job.company}`);
    this.closeModal();
  }
}
