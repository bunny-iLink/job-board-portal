import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

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

    logout(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}
