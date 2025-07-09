import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { LayoutComponent } from './components/common/layout/layout'; // Eagerly loaded for both employer and user

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/common/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/common/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/common/home/home').then((m) => m.HomeComponent),
  },

  // Employer routes
  {
    path: 'employer',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    data: { roles: ['employer'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/common/dashboard/dashboard').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/common/profile/profile').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'my-listings',
        loadComponent: () =>
          import('./components/employer-specific-components/my-listings/my-listings').then(
            (m) => m.MyListingsComponent
          ),
      },
      {
        path: 'job-details',
        loadComponent: () =>
          import('./components/employer-specific-components/job-details/job-details').then(
            (m) => m.JobDetailsComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },

  // User routes
  {
    path: 'user',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    data: { roles: ['user'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/common/dashboard/dashboard').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/common/profile/profile').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./components/user-specific-components/search-jobs/search-jobs').then(
            (m) => m.SearchJobsComponent
          ),
      },
      {
        path: 'applied-jobs',
        loadComponent: () =>
          import('./components/user-specific-components/applied-jobs/applied-jobs').then(
            (m) => m.AppliedJobsComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/common/unauthorized/unauthorized').then(
        (m) => m.Unauthorized
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./components/common/not-found/not-found').then((m) => m.NotFound),
  },

  // Default route
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },

  // Catch-all route (MUST be last)
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
