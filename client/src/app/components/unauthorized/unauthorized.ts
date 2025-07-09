import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
})
export class Unauthorized {
  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}
