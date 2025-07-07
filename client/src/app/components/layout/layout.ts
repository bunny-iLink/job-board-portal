import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: 'layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {}
