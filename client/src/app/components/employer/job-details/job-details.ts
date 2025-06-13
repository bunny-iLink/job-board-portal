import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
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
  token: string | null = null;

  loadingJobDetails = false;
  constructor(private route: ActivatedRoute, private http: HttpClient, private jobService: JobService, private applicationService: ApplicationService, private authService: AuthService) { }

  ngOnInit(): void {
    this.token = this.authService.getToken();

    this.route.queryParamMap.subscribe(params => {
      this.jobId = params.get('id') || '';
      if (this.jobId && this.token) {
        this.loadJobDetails(); // ✅ Only one call now
      }
    });
  }


  // Fetch job details and list of applicants from backend
  loadJobDetails(): void {
    this.loadingJobDetails = true;
    this.jobService.getJobById(this.jobId!, this.token!)
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
          console.log(this.applicants);

        },
        error: err => {
          console.error('Failed to load job details:', err);
        },
        complete: () => {
          this.loadingJobDetails = false;
        }
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

    this.applicationService.updateStatus(applicationId, this.token!, newStatus).subscribe({
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