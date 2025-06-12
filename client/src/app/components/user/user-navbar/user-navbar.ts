// Angular component for the user navigation bar
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
  // Stores the user's name for display
  userName: string | null = null;
  // JWT token for authentication
  token: string | null = null;
  // List of user notifications
  notifications: any[] = [];
  // Controls notification dropdown visibility
  showNotifications = false;
  // Controls mobile menu visibility
  showMobileMenu = false;

  loadingNotifications = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  // On component initialization, get token and user name from AuthService
  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
  }

  // Log the user out, clear session, and redirect to login
  logout(): void {
    this.authService.logout();
    alert('Logged out successfully...');
    this.router.navigate(['/login']);
  }

  // Navigate to job listings page
  goToListings(): void {
    this.router.navigate(['/user/jobs']);
  }

  // Navigate to user profile page
  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  // Navigate to user dashboard
  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  // Navigate to applied jobs page
  goToAppliedJobs(): void {
    this.router.navigate(['/user/applied-jobs']);
  }

  // Toggle notification dropdown and fetch notifications from backend if opening
  toggleNotifications(): void {
    // Toggle visibility ON
    this.showNotifications = true;
    this.loadingNotifications = true;

    const userId = this.authService.getUserId();
    this.http.get(environment.apiUrl + `/api/notifications/${userId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (data: any) => {
        this.notifications = data.notifications || [];
        this.loadingNotifications = false;
      },
      error: (error) => {
        console.error('Error fetching notifications', error);
        this.loadingNotifications = false;
      }
    });
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  // Toggle mobile menu visibility
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
