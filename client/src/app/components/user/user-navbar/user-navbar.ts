// Angular component for the user navigation bar
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { NotificationsService } from '../../../service/notifications.service';
import { AlertComponent } from '../../alert/alert.component';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  templateUrl: 'user-navbar.html',
  styleUrls: ['./user-navbar.css'],
  imports: [CommonModule, AlertComponent, ConfirmComponent]
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

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  // Variables for Confirm dialog
  confirmMessage: string = '';
  showConfirm: boolean = false;

  private showCustomAlert(message: string, type: 'success' | 'error' | 'info', navigate: boolean = false) {
    console.log("Alert Triggered:", { message, type });

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  // Called when the alert is closed by the user
  onAlertClosed(): void {
    this.showAlert = false;
    this.router.navigate(['/login'])
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationsService
  ) { }

  // On component initialization, get token and user name from AuthService
  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
  }

  // Log the user out, clear session, and redirect to login
  logout(): void {
    this.showMobileMenu = false; // Close mobile menu before showing confirm dialog
    this.confirmMessage = 'Are you sure you want to log out?';
    this.showConfirm = true;
  }

  onConfirmLogout(): void {
    this.authService.logout();
    this.showCustomAlert('Logged out successfully...', 'success', true);
    this.showConfirm = false;
  }

  onCancelLogout(): void {
    this.showConfirm = false;
  }

  // Navigate to job listings page
  goToListings(): void {
    this.router.navigate(['/user/jobs']);
    this.showMobileMenu = false; // Close mobile menu after navigation
  }

  // Navigate to user profile page
  goToProfile(): void {
    this.router.navigate(['/user/profile']);
    this.showMobileMenu = false; // Close mobile menu after navigation
  }

  // Navigate to user dashboard
  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  // Navigate to applied jobs page
  goToAppliedJobs(): void {
    this.router.navigate(['/user/applied-jobs']);
    this.showMobileMenu = false; // Close mobile menu after navigation
  }

  // Toggle notification dropdown and fetch notifications from backend if opening
  toggleNotifications(): void {
    // Toggle visibility ON
    this.showNotifications = !this.showNotifications;
    this.loadingNotifications = true;

    const userId = this.authService.getUserId();
    this.notificationService.getNotifications(userId!, this.token!).subscribe({
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

    goToHome(): void {
    this.router.navigate(['/']);
  }

  parseNotification(message: string): { jobTitle: string; status: string; statusClass: string } | null {
    const jobMatch = message.match(/job "(.*?)"/);
    const statusMatch = message.match(/'(Accepted|Rejected|In Progress)'/);

    if (jobMatch && statusMatch) {
      const jobTitle = jobMatch[1];
      const status = statusMatch[1];

      let statusClass = '';
      if (status === 'Accepted') {
        statusClass = 'accepted';
      } else if (status === 'Rejected') {
        statusClass = 'rejected';
      } else if (status === 'In Progress') {
        statusClass = 'in-progress';
      }

      return { jobTitle, status, statusClass };
    }

    return null;
  }
}
