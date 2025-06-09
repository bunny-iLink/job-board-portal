import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-details.html',
  styleUrls: ['./job-details.css']
})
export class JobDetailsComponent implements OnInit {
  jobId: string = '';
  job: any = null;
  applicants: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.loadJobDetails();
      //his.loadApplicants();
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


  // loadApplicants() {
  //   this.http.get<any[]>(`http://localhost:3000/api/job/${this.jobId}/applicants`).subscribe({
  //     next: res => this.applicants = res,
  //     error: err => console.error('Failed to load applicants:', err)
  //   });
  // }
}
