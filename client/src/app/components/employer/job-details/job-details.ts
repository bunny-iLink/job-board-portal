import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
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
    // Get job ID from route parameters and load job details
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.loadJobDetails();
    }
  }

  // Fetch job details and list of applicants from backend
  loadJobDetails() {
    this.http.get<{ job: any; applicants: any[] }>(environment.apiUrl +`/api/getJobById/${this.jobId}`)
      .subscribe({
        next: res => {
          this.job = res.job;
          this.applicants = res.applicants;
          // Pre-create blob URLs for all resumes for quick access
          this.applicants.forEach(applicant => {
            if (applicant.userId?.resume?.data) {
              this.createResumeBlobUrl(applicant);
            }
          });
        },
        error: err => console.error('Failed to load job details:', err)
      });
  }

  // Create a blob URL for an applicant's resume (PDF) for viewing/downloading
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

  // Open an applicant's resume in a new tab or trigger download if blocked
  openResume(applicantId: string) {
    const url = this.resumeBlobUrls[applicantId];
    if (url) {
      // Try to open in new tab
      const win = window.open(url, '_blank');

      // Fallback if popup is blocked
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
    // Clean up blob URLs when component is destroyed to free memory
    Object.values(this.resumeBlobUrls).forEach(url => URL.revokeObjectURL(url));
  }

  // Change the status of an applicant's application (e.g., Accept/Reject)
  onStatusChange(applicationId: string, newStatus: string) {
    const confirmed = window.confirm(`Are you sure you want to change the status to "${newStatus}"?`);
    if (!confirmed) return;

    this.http.put(environment.apiUrl +`/api/${applicationId}/status`, {
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