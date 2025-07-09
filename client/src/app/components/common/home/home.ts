import { Component, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    AOS.init({ once: true });
  }
}
