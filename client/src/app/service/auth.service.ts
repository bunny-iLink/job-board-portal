import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { tap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
  user: any; // or a proper User type
  refresh_token: string; // Optional, if your API returns a refresh token
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

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null; // no localStorage on server
    }
    return localStorage.getItem('refreshToken');
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
          localStorage.setItem('refreshToken', response.refresh_token); // Store refresh token if available
        }
      })
    );
  }

  refreshToken(refreshToken: string): Observable<string> {
    console.log("🔁 Sending refresh token to server:", refreshToken);

    return this.http
      .post<{ accessToken: string }>(`${environment.apiUrl}/refreshToken`, { refreshToken })
      .pipe(
        map((response) => {
          console.log("✅ New access token received from server:", response.accessToken);
          localStorage.setItem('token', response.accessToken);

          const stored = localStorage.getItem('token');
          console.log("📦 Token stored in localStorage:", stored);
          return response.accessToken;
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
