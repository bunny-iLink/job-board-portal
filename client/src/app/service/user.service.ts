import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class UserService {
    constructor(private http: HttpClient) { }

    getUserData(userId: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/getUserData/${userId}`);
    }

    updateUserData(userId: string, data: any, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${environment.apiUrl}/updateUser/${userId}`, data, { headers })
    }

    deleteUser(userId: string, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${environment.apiUrl}/deleteUser/${userId}`, { headers });
    }
}