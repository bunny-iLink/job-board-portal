// Angular component for the employer navigation bar
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../alert/alert.component';

@Component({
  selector: 'app-employer-navbar',
  standalone: true,
  templateUrl: 'employer-navbar.html',
  styleUrls: ['./employer-navbar.css'],
  imports: [CommonModule, AlertComponent]
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

  constructor(private router: Router, private authService: AuthService) { }

  // On component initialization, get token and user name from AuthService
  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
  }

  // Log the employer out, clear session, and redirect to login
  logout(): void {
    this.showCustomAlert("Logged out successfully", 'success', true)
    this.authService.logout();
  }

  // Navigate to employer's job listings page
  goToListings(): void {
    this.router.navigate(['/employer/my-listings']);
  }

  // Navigate to employer profile page
  goToProfile(): void {
    this.router.navigate(['/employer/profile']);
  }

  // Navigate to employer dashboard
  goToDashboard(): void {
    this.router.navigate(['/employer/dashboard']);
  }
}
