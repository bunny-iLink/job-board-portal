import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class JobService {
    constructor(private http: HttpClient) { }

    addJob(data: any, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${environment.apiUrl}/addJob`, data, { headers })
    }

    getJobSummaries(employerId: string, token: string) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any>(`${environment.apiUrl}/employer/${employerId}/jobs-summary`, { headers });
    }

    getJobById(jobId: string, token: string): Observable<{ job: any; applicants: any[] }> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<{ job: any; applicants: any[] }>(`${environment.apiUrl}/getJobById/${jobId}`, { headers })
    }

    getJobs(employerId: string, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any>(`${environment.apiUrl}/getJobs/${employerId}`, { headers })
    }

    updateJob(jobId: string, payload: any, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${environment.apiUrl}/updateJob/${jobId}`, payload, { headers });
    }

    deleteJob(jobId: string, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${environment.apiUrl}/deleteJob/${jobId}`, { headers });
    }

    appliedJobs(userId: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/appliedJobs/${userId}`);
    }

    searchJobs(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/searchJobs`);
    }

    searchJobsWithFilter(queryString: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/searchJobs?${queryString}`);
    }
}