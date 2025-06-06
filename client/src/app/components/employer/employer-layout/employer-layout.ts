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

}
