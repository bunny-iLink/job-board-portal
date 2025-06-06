import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  templateUrl: './user-navbar.html',
  styleUrls: ['./user-navbar.css'], // fixed typo
  imports: [CommonModule]
})

export class UserNavbar implements AfterViewInit{
  userName = 'John'; // for the greeting message
  token: string | null = null;

  constructor (private router: Router) { }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    alert("Logged out successfully....");
    this.router.navigate(['/login']);
  }
}
