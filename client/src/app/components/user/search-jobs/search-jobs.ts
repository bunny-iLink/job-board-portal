import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
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

  filters = {
    type: '',
    experience: '',
    minSalary: '',
    maxSalary: ''
  };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.searchJobs();
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getStoredUser() {
    if (this.isBrowser()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.warn('Invalid JSON in localStorage');
        }
      }
    }
    return null;
  }

  searchJobs() {
    const user = this.getStoredUser();
    if (!user) {
      console.warn('User not found in localStorage');
      return;
    }

    const queryParams: any = {
      userId: user._id,
      domain: user.preferredDomain,
      search: this.searchTerm.trim()
    };

    if (this.filters.type) queryParams.type = this.filters.type;
    if (this.filters.experience) queryParams.experience = this.filters.experience;
    if (this.filters.minSalary) queryParams.minSalary = this.filters.minSalary;
    if (this.filters.maxSalary) queryParams.maxSalary = this.filters.maxSalary;

    const queryString = new URLSearchParams(queryParams).toString();

    this.http.get(environment.apiUrl +`/api/searchJobs?${queryString}`)
      .subscribe({
        next: (res: any) => {
          this.allJobs = res;
          this.filteredJobs = [...res];
        },
        error: (err) => console.error('Error fetching jobs:', err)
      });
  }

  openJobModal(job: any) {
    this.selectedJob = job;
    this.showModal = true;
  }

  closeModal() {
    this.selectedJob = null;
    this.showModal = false;
  }

  applyToJob(job: any) {
    const user = this.getStoredUser();
    if (!user) {
      alert('Please log in to apply.');
      return;
    }

    // Check if profile is complete
    if (!this.isProfileComplete(user)) {
      alert('Please complete your profile (name, email, and resume are required) before applying for jobs.');
      return;
    }

    const payload = {
      userId: user._id,
      jobId: job._id
    };

    this.http.post(environment.apiUrl +'/api/applyForJob', payload).subscribe({
      next: (res: any) => {
        alert(res.message || 'Application submitted!');
        this.closeModal();
        this.searchJobs();
      },
      error: (err) => {
        if (err.status === 409) {
          alert('Already applied to this job.');
        } else {
          console.error('Application error:', err);
          alert('Failed to apply.');
        }
        this.closeModal();
      }
    });
  }

  // Add this new method to check profile completeness
  isProfileComplete(user: any): boolean {
    // Check basic info
    if (!user?.name?.trim() || !user?.email?.trim()) {
      return false;
    }

    // Check resume exists and has data
    if (!user?.resume?.data) {
      return false;
    }

    // Optionally check other important fields
    const recommendedFields = ['phone', 'address', 'experience', 'preferredDomain'];
    for (const field of recommendedFields) {
      if (!user[field]) {
        if (confirm('Your profile is missing some recommended information. Apply anyway?')) {
          return true;
        }
        return false;
      }
    }

    return true;
  }
}
