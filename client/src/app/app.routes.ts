import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { EmployerDashboardComponent } from './components/employer/dashboard/employer-dashboard.component'
import { UserDashboardComponent } from './components/user/dashboard/user-dashboard.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'employer/dashboard', component: EmployerDashboardComponent },
  { path: 'user/dashboard', component: UserDashboardComponent },
  // other routes...
];
