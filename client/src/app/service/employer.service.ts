import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployerService {
  constructor(private http: HttpClient) {}

  getEmployerData(employerId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(
      `${environment.apiUrl}/getEmployerData/${employerId}`,
      { headers }
    );
  }

  updateEmployer(
    employerId: string,
    data: any,
    token: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(
      `${environment.apiUrl}/updateEmployer/${employerId}`,
      data,
      { headers }
    );
  }

  deleteEmployer(employerId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(
      `${environment.apiUrl}/deleteEmployer/${employerId}`,
      { headers }
    );
  }

    getApplicationStatusSummary(employerId: string, token: string) {
        return this.http.get<any>(`${environment.apiUrl}/echartStatus/${employerId}`, {
        headers: { Authorization: `Bearer ${token}` }
  });
}


}