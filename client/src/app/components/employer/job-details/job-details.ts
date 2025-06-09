import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'job-details.html',
  styleUrls: ['job-details.css']
})
export class JobDetailsComponent implements OnInit {
  jobId: string = '';
  job: any = null;
  applicants: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.loadJobDetails();
    }
  }

  loadJobDetails() {
    this.http.get<{ job: any; applicants: any[] }>(`http://localhost:3000/api/getJobById/${this.jobId}`)
      .subscribe({
        next: res => {
          this.job = res.job;
          this.applicants = res.applicants;
        },
        error: err => console.error('Failed to load job details:', err)
      });
  }

  onStatusChange(applicationId: string, newStatus: string) {
    const confirmed = window.confirm(`Are you sure you want to change the status to "${newStatus}"?`);

    if (!confirmed) {
      return;
    }

    this.http.put(`http://localhost:3000/api/${applicationId}/status`, {
      status: newStatus
    }).subscribe({
      next: () => {
        const applicant = this.applicants.find(a => a._id === applicationId);
        if (applicant) {
          applicant.status = newStatus;
        }
      },
      error: err => console.error('Failed to update status:', err)
    });
  }


}
