// src/app/auth/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { switchMap, catchError, map } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();
    const router = inject(Router);

    if (token) {
        // console.log("🔐 Attaching access token to request:", token);
    } else {
        console.warn("⚠️ No access token found for request");
    }

    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error) => {
            // 🔄 Only try refresh if token expired and refresh token is present
            if (error.status === 401 && authService.getRefreshToken()) {
                const refreshToken = authService.getRefreshToken()!;
                // console.warn("🔄 Access token expired — attempting refresh...");
                // console.log("🔁 Sending refresh token to server:", refreshToken);

                return authService.refreshToken(refreshToken).pipe(
                    switchMap((newToken: string) => {
                        // console.log("✅ New access token received:", newToken);
                        localStorage.setItem('token', newToken);

                        const storedToken = localStorage.getItem('token');
                        // console.log("📦 Confirmed token in localStorage:", storedToken);

                        // 🔁 Retry original request with new token
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` },
                        });

                        // console.log("🔁 Retrying original request with new token...");

                        return next(retryReq).pipe(
                            catchError(retryError => {
                                if (retryError.status === 401) {
                                    // console.error("❌ Retried request failed with 401 — logging out");
                                    authService.logout();
                                    router.navigate(['/login']);
                                } else {
                                    console.warn("⚠️ Retried request failed with non-auth error:", retryError.status);
                                }
                                return throwError(() => retryError);
                            })
                        );
                    }),
                    catchError(refreshError => {
                        console.error("❌ Refresh token request failed:", refreshError.message);
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
