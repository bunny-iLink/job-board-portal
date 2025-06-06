import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

import { EmployerDashboardComponent } from './components/employer/dashboard/employer-dashboard.component';
import { UserDashboardComponent } from './components/user/dashboard/user-dashboard.component';

import { EmployerLayoutComponent } from './components/employer/employer-layout/employer-layout';
import { UserLayoutComponent } from './components/user/user-layout/user-layout';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'employer',
    component: EmployerLayoutComponent,
    children: [
      { path: 'dashboard', component: EmployerDashboardComponent },
      // Add more employer routes here
    ]
  },

  {
    path: 'user',
    component: UserLayoutComponent,
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      // Add more user routes here
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
