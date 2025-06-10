import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-user-navbar',
  standalone: true,
  templateUrl: 'user-navbar.html',
  styleUrls: ['./user-navbar.css'],
  imports: [CommonModule]
})
export class UserNavbar implements OnInit {
  userName: string | null = null;
  token: string | null = null;
  notifications: any[] = [];
  showNotifications = false;
  showMobileMenu = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
    alert('Logged out successfully...');
    this.router.navigate(['/login']);
  }

  goToListings(): void {
    this.router.navigate(['/user/jobs']);
  }

  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  goToAppliedJobs(): void {
    this.router.navigate(['/user/applied-jobs']);
  }

  toggleNotifications(): void {
    if (!this.showNotifications) {
      const userId = this.authService.getUserId(); // Ensure this method exists in AuthService
      this.http.get(environment.apiUrl +`/api/notifications/${userId}`).subscribe({
        next: (data: any) => {
          this.notifications = data.notifications;
          this.showNotifications = true;
        },
        error: (error) => {
          console.error('Error fetching notifications', error);
        }
      });
    } else {
      this.showNotifications = false;
    }
  }
  
  toggleMobileMenu() {
  this.showMobileMenu = !this.showMobileMenu;
}
}
