import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';

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
    this.router.navigate(['/user/jobs']);
  }

  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
