import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';
import { ConfirmComponent } from '../../common/confirm/confirm.component';
import { AlertComponent } from '../../common/alert/alert.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmComponent, AlertComponent],
  templateUrl: 'job-details.html',
  styleUrls: ['job-details.css'],
})
export class JobDetailsComponent implements OnInit {
  jobId: string = '';
  job: any = null;
  applicants: any[] = [];
  resumeBlobUrls: { [key: string]: string } = {}; // Store blob URLs by applicant ID
  token: string | null = null;

  loadingJobDetails = false;
  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;

  // Variables for Confirm
  confirmMessage = '';
  showConfirm = false;
  selectedApplicationId = '';
  newStatusToSet = '';

  readonly baseUrl = environment.apiUrl;

  ngOnInit(): void {
    this.token = this.authService.getToken();

    this.route.queryParamMap.subscribe((params) => {
      this.jobId = params.get('id') || '';
      if (this.jobId && this.token) {
        this.loadJobDetails(); // ✅ Only one call now
      }
    });
  }

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info') {
    console.log('Alert Triggered:', { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }

  onAlertClosed(): void {
    this.showAlert = false;
  }

  // Fetch job details and list of applicants from backend
  loadJobDetails(): void {
    this.loadingJobDetails = true;
    this.jobService.getJobById(this.jobId!, this.token!).subscribe({
      next: (res) => {
        this.job = res.job;
        this.applicants = res.applicants;
        // Pre-create blob URLs for all resumes for quick access
        this.applicants.forEach((applicant) => {
          if (applicant.userId?.resume?.data) {
            this.createResumeBlobUrl(applicant);
          }
        });
        console.log(this.applicants);
      },
      error: (err) => {
        console.error('Failed to load job details:', err);
      },
      complete: () => {
        this.loadingJobDetails = false;
      },
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
      const blob = new Blob([byteArray], {
        type: applicant.userId.resume.contentType,
      });
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

  onStatusClick(applicationId: string, newStatus: string) {
    this.confirmMessage = `Are you sure you want to change the status to "${newStatus}"?`;
    this.selectedApplicationId = applicationId;
    this.newStatusToSet = newStatus;
    this.showConfirm = true;
  }

  onConfirmStatusChange() {
    this.applicationService
      .updateStatus(
        this.selectedApplicationId,
        this.token!,
        this.newStatusToSet
      )
      .subscribe({
        next: () => {
          const a = this.applicants.find(
            (x) => x._id === this.selectedApplicationId
          );
          if (a) a.status = this.newStatusToSet;
          this.resetConfirm();
          this.showCustomAlert('Status changed successfuully', 'success');
        },
        error: (err) => {
          console.error('Failed to update status:', err);
          this.resetConfirm();
        },
      });
  }

  onCancelStatusChange() {
    this.resetConfirm();
  }

  resetConfirm() {
    this.showConfirm = false;
    this.selectedApplicationId = '';
    this.newStatusToSet = '';
    this.confirmMessage = '';
  }

  ngOnDestroy() {
    // Clean up blob URLs when component is destroyed to free memory
    Object.values(this.resumeBlobUrls).forEach((url) =>
      URL.revokeObjectURL(url)
    );
  }

  // Change the status of an applicant's application (e.g., Accept/Reject)
  onStatusChange(applicationId: string, newStatus: string) {
    this.onStatusClick(applicationId, newStatus);
  }

  downloadAcceptedApplicantsCSV() {
    const acceptedApplicants = this.applicants.filter(
      (app) => app.status === 'Accepted'
    );

    if (acceptedApplicants.length === 0) {
      this.showCustomAlert('No accepted applicants found.', 'info');
      return;
    }

    const csvRows = [
      ['Name', 'Email', 'Contact Number'], // header
      ...acceptedApplicants.map((app) => [
        app.userId?.name || '',
        app.userId?.email || '',
        app.userId?.phone || 'N/A',
      ]),
    ];

    const csvContent = csvRows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accepted_applicants_${this.jobId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  getProfilePicture(applicant: any): string {
    const base64Data = applicant.userId?.profilePicture?.data;
    if (!base64Data) {
      return 'assets/default-profile.png'; // fallback image
    }
    return `data:image/png;base64,${base64Data}`;
  }



}
