import { Routes } from '@angular/router';

// Import the eagerly loaded EmployerLayoutComponent since we need to use it as `component` (not lazy-loaded)
import { EmployerLayoutComponent } from './components/employer/employer-layout/employer-layout';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'employer',
    component: EmployerLayoutComponent,  // Use component here for layout with children
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/employer/dashboard/employer-dashboard.component').then(m => m.EmployerDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/employer/employer-profile/employer-profile').then(m => m.EmployerProfileComponent)
      },
      {
        path: 'my-listings',
        loadComponent: () => import('./components/employer/my-listings/my-listings').then(m => m.MyListingsComponent)
      }
    ]
  },

  {
    path: 'user',
    loadComponent: () => import('./components/user/user-layout/user-layout').then(m => m.UserLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/user/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/user/user-profile/user-profile').then(m => m.UserProfileComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./components/user/search-jobs/search-jobs').then(m => m.SearchJobsComponent)
      }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
  path: 'job/:id',
  loadComponent: () => import('../app/components/employer/job-details/job-details').then(m => m.JobDetailsComponent)
}

];
