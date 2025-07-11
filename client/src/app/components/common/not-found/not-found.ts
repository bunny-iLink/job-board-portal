import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {
  constructor(private router: Router, private authService: AuthService) { }

  goToDashboard(): void {
    const role = this.authService.getUserRole();
    if (!role) {
      console.warn('No user role found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate([`${role}/dashboard`]);
  }
}
