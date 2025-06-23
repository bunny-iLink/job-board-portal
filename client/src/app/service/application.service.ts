import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient) {}

  applyForJob(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${environment.apiUrl}/applyForJob`, data, {
      headers,
    });
  }

  updateStatus(
    applicationId: string,
    token: string,
    status: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { status };
    return this.http.put(
      `${environment.apiUrl}/${applicationId}/status`,
      body,
      { headers }
    );
  }

  revokeApplication(applicationId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(
      `${environment.apiUrl}/revokeApplication/${applicationId}`,
      { headers }
    );
  }
}
