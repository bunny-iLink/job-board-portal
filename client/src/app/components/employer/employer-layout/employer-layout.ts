// Angular layout component for employer pages, providing a shared navbar and router outlet
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar';

@Component({
  selector: 'app-employer-layout',
  standalone: true,
  imports: [RouterOutlet,  NavbarComponent],
  templateUrl: './employer-layout.html',
  styleUrl: './employer-layout.css'
})
export class EmployerLayoutComponent {
  // This component acts as a shell for all employer-related routes
}
