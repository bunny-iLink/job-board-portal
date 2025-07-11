import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
})
export class Unauthorized {
  constructor(private router: Router, private authService : AuthService) { }
  role = ""

  ngOnInit(): void {
    this.role = this.authService.getUserRole()!;
  }

  goHome(): void {
    this.router.navigate([`/${this.role}/dashboard`]);
  }

  goLogin(): void {
    this.router.navigate(['/home']);
  }
}
