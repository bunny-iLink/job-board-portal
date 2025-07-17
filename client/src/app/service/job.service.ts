import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) { }

  addJob(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/addJob`, data, { headers });
  }

  getJobSummaries(employerId: string, token: string, page: number = 1) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { page: page.toString() };

    return this.http.get<any>(
      `${environment.apiUrl}/employer/${employerId}/jobs-summary`,
      { headers, params }
    );
  }

  getJobById(
    jobId: string,
    token: string
  ): Observable<{ job: any; applicants: any[] }> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ job: any; applicants: any[] }>(
      `${environment.apiUrl}/getJobById/${jobId}`,
      { headers }
    );
  }

  getJobs(employerId: string, token: string, page: number = 1): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { page: page.toString() };

    return this.http.get<any>(`${environment.apiUrl}/getJobs/${employerId}`, {
      headers,
      params,
    });
  }

  updateJob(jobId: string, payload: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${environment.apiUrl}/updateJob/${jobId}`, payload, {
      headers,
    });
  }

  deleteJob(jobId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${environment.apiUrl}/deleteJob/${jobId}`, {
      headers,
    });
  }

  appliedJobs(userId: string, page: number = 1, limit: number = 5): Observable<any> {
    return this.http.get(`${environment.apiUrl}/appliedJobs/${userId}?page=${page}&limit=${limit}`);
  }

  searchJobs(params: Record<string, any> = {}) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get(`${environment.apiUrl}/searchJobs`, {
      params: httpParams,
    });
  }
}
