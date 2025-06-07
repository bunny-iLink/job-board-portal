import { OnInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { log } from 'console';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  userId: string | null = null;
  token: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (typeof window != 'undefined') {
      this.token = localStorage.getItem('token');

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.userId = user._id;

        this.http.get(`http://localhost:3000/api/getUserData/${this.userId}`).subscribe({
          next: (res: any) => {
            this.user = res.user;
            console.log("User loaded: ", this.user);
          },
          error: err => {
            console.error("Failed to load user data: ", err);
            
          }
        })
      } else {
        console.warn("No user found");
        
      }
    }
  }
}
