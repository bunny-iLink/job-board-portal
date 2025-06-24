import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
  user: any; // or a proper User type
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) { }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null; // no localStorage on server
    }
    return localStorage.getItem('token');
  }

  getUser(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserId(): string | null {
    return this.getUser()?._id ?? null;
  }

  getUserName(): string | null {
    const user = this.getUser();
    return user?.name ?? null;
  }
  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role ?? null;
  }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, data).pipe(
      tap((response: LoginResponse) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
