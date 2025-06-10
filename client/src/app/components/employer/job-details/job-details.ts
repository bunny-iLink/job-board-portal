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
  resumeBlobUrls: { [key: string]: string } = {}; // Store blob URLs by applicant ID

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
          // Pre-create blob URLs for all resumes
          this.applicants.forEach(applicant => {
            if (applicant.userId?.resume?.data) {
              this.createResumeBlobUrl(applicant);
            }
          });
        },
        error: err => console.error('Failed to load job details:', err)
      });
  }

  createResumeBlobUrl(applicant: any) {
    try {
      const byteCharacters = atob(applicant.userId.resume.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: applicant.userId.resume.contentType });
      this.resumeBlobUrls[applicant._id] = URL.createObjectURL(blob);
    } catch (e) {
      console.error('Error creating resume blob URL:', e);
    }
  }

  openResume(applicantId: string) {
    const url = this.resumeBlobUrls[applicantId];
    if (url) {
      // Try to open in new tab
      const win = window.open(url, '_blank');

      // Fallback if blocked
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = `resume_${applicantId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  }

  ngOnDestroy() {
    // Clean up blob URLs when component is destroyed
    Object.values(this.resumeBlobUrls).forEach(url => URL.revokeObjectURL(url));
  }

  onStatusChange(applicationId: string, newStatus: string) {
    const confirmed = window.confirm(`Are you sure you want to change the status to "${newStatus}"?`);
    if (!confirmed) return;

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