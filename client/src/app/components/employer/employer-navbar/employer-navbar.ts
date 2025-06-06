import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employer-navbar',
  standalone: true,
  templateUrl: './employer-navbar.html',
  styleUrls: ['./employer-navbar.css'], // fixed typo
  imports: [CommonModule]
})
export class EmployerNavbar implements AfterViewInit {
  constructor (private router: Router) { };
  userName = 'John'; // for the greeting message
  token: string | null = null;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    alert("Logged out successfully...")
    this.router.navigate(['/login']);
  }
}
