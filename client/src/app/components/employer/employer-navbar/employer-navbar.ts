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
  userName: string | null = null;
  token: string | null = null;

  constructor(private router: Router, private authService: AuthService) { }

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
    this.router.navigate(['/employer/profile']);
  }

  goToProfile(): void {
    this.router.navigate(['/employer/profile']);
  }

  goToDashboard(): void {
    this.router.navigate(['/employer/dashboard']);
  }
}
