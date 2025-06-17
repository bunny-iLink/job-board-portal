// Angular component for the employer navigation bar
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../alert/alert.component';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'app-employer-navbar',
  standalone: true,
  templateUrl: 'employer-navbar.html',
  styleUrls: ['./employer-navbar.css'],
  imports: [CommonModule, AlertComponent, ConfirmComponent]
})
export class EmployerNavbar implements OnInit {
  // Stores the employer's name for display
  userName: string | null = null;
  // JWT token for authentication
  token: string | null = null;

  // Variables for alert
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;
  navigateAfterAlert: boolean = false;

  // Confirm dialog variables
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
    if (this.navigateAfterAlert) {
      this.router.navigate(['/login']);
    }
  }

  showMobileMenu: boolean = false;

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  constructor(private router: Router, private authService: AuthService) { }

  // On component initialization, get token and user name from AuthService
  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
  }

  
  logout(): void {
    this.showMobileMenu = false; // Close mobile menu before showing confirm dialog
    this.confirmMessage = 'Are you sure you want to log out?';
    this.showConfirm = true;
  }

  // Log the employer out, clear session, and redirect to login
  onConfirmLogout(): void {
    this.authService.logout();
    this.showCustomAlert('Logged out successfully', 'success', true);
    this.showConfirm = false;
  }

  onCancelLogout(): void {
    this.showConfirm = false;
  }

  // Navigate to employer's job listings page
  goToListings(): void {
    this.router.navigate(['/employer/my-listings']);
    this.showMobileMenu = false; // Close mobile menu after navigation
  }

  // Navigate to employer profile page
  goToProfile(): void {
    this.router.navigate(['/employer/profile']);
    this.showMobileMenu = false; // Close mobile menu after navigation
  }

  // Navigate to employer dashboard
  goToDashboard(): void {
    this.router.navigate(['/employer/dashboard']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
