import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from '../user-navbar/user-navbar';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, UserNavbar],
  templateUrl: 'user-layout.html',
  styleUrl: './user-layout.css'
})
export class UserLayoutComponent {

}
