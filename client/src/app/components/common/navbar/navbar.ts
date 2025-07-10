import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { NotificationsService } from '../../../service/notifications.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [CommonModule, AlertComponent, ConfirmComponent],
})
export class NavbarComponent implements OnInit {
  userName: string | null = null;
  token: string | null = null;
  role: string | null = null;
  currentPage = 1;
  hasMoreNotifications = false;


  // Shared states
  showMobileMenu = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert = false;
  navigateAfterAlert = false;
  confirmMessage = '';
  showConfirm = false;

  // Notifications (User only)
  notifications: any[] = [];
  showNotifications = false;
  loadingNotifications = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
    this.role = this.authService.getUserRole();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleNotifications(): void {
    if (this.role !== 'user') return;

    if (this.showNotifications) {
      this.showNotifications = false;
      return;
    }

    this.showNotifications = true;
    this.loadingNotifications = true;
    this.currentPage = 1;

    const userId = this.authService.getUserId();
    this.notificationService.getNotifications(userId!, this.token!, this.currentPage).subscribe({
      next: (data: any) => {
        this.notifications = data.notifications || [];
        this.hasMoreNotifications = data.pagination?.totalPages > this.currentPage;
        this.loadingNotifications = false;
      },
      error: () => {
        this.loadingNotifications = false;
      },
    });
  }

  loadMoreNotifications(): void {
    const userId = this.authService.getUserId();
    this.loadingNotifications = true;
    this.currentPage++;

    this.notificationService.getNotifications(userId!, this.token!, this.currentPage).subscribe({
      next: (data: any) => {
        this.notifications = [...this.notifications, ...(data.notifications || [])];
        this.hasMoreNotifications = data.pagination?.totalPages > this.currentPage;
        this.loadingNotifications = false;
      },
      error: () => {
        this.loadingNotifications = false;
      },
    });
  }

  clearNotifications(): void {
    const userId = this.authService.getUserId();
    this.notificationService.clearNotifications(userId!, this.token!).subscribe({
      next: () => {
        this.notifications = [];
        this.showNotifications = false;
        this.showCustomAlert('Notifications cleared successfully', 'success');
      },
      error: () => {
        this.showCustomAlert('Failed to clear notifications', 'error');
      },
    });
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  logout(): void {
    this.showMobileMenu = false;
    this.confirmMessage = 'Are you sure you want to log out?';
    this.showConfirm = true;
  }

  onConfirmLogout(): void {
    this.authService.logout();
    this.showCustomAlert('Logged out successfully', 'success', true);
    this.showConfirm = false;
  }

  onCancelLogout(): void {
    this.showConfirm = false;
  }

  showCustomAlert(
    message: string,
    type: 'success' | 'error' | 'info',
    navigate: boolean = false
  ) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.navigateAfterAlert = navigate;
  }

  onAlertClosed(): void {
    this.showAlert = false;
    if (this.navigateAfterAlert) {
      this.router.navigate(['/login']);
    }
  }

  // Navigation Methods
  goToDashboard(): void {
    this.router.navigate([`/${this.role}/dashboard`]);
  }

  goToListings(): void {
    this.router.navigate([
      `/${this.role}/${this.role === 'user' ? 'jobs' : 'my-listings'}`,
    ]);
    this.showMobileMenu = false;
  }

  goToProfile(): void {
    this.router.navigate([`/${this.role}/profile`]);
    this.showMobileMenu = false;
  }

  goToAppliedJobs(): void {
    if (this.role === 'user') {
      this.router.navigate(['/user/applied-jobs']);
      this.showMobileMenu = false;
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  parseNotification(
    message: string
  ): { jobTitle: string; status: string; statusClass: string } | null {
    const jobMatch = message.match(/job "(.*?)"/);
    const statusMatch = message.match(/'(Accepted|Rejected|In Progress)'/);
    if (jobMatch && statusMatch) {
      const jobTitle = jobMatch[1];
      const status = statusMatch[1];
      const statusClass =
        status === 'Accepted'
          ? 'accepted'
          : status === 'Rejected'
            ? 'rejected'
            : 'in-progress';
      return { jobTitle, status, statusClass };
    }
    return null;
  }
}
