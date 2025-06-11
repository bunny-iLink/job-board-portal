// Angular component for the employer navigation bar
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employer-navbar',
  standalone: true,
  templateUrl: 'employer-navbar.html',
  styleUrls: ['./employer-navbar.css'],
  imports: [CommonModule]
})
export class EmployerNavbar implements OnInit {
  // Stores the employer's name for display
  userName: string | null = null;
  // JWT token for authentication
  token: string | null = null;

  constructor(private router: Router, private authService: AuthService) { }

  // On component initialization, get token and user name from AuthService
  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.userName = this.authService.getUserName();
  }

  // Log the employer out, clear session, and redirect to login
  logout(): void {
    this.authService.logout();
    alert('Logged out successfully...');
    this.router.navigate(['/login']);
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
