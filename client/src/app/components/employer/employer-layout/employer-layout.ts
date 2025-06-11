// Angular layout component for employer pages, providing a shared navbar and router outlet
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployerNavbar } from '../employer-navbar/employer-navbar';

@Component({
  selector: 'app-employer-layout',
  standalone: true,
  imports: [RouterOutlet, EmployerNavbar],
  templateUrl: './employer-layout.html',
  styleUrl: './employer-layout.css'
})
export class EmployerLayoutComponent {
  // This component acts as a shell for all employer-related routes
}
