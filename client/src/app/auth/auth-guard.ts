// Angular route guard to protect routes based on authentication and user role
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// authGuard checks if the user is authenticated and authorized to access a route
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Ensure code runs only in browser (not server-side rendering)
  if (typeof window !== 'undefined') {
    // Retrieve token and user data from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user'); // store user info as JSON

    // If both token and user data exist, proceed to check role
    if (token && userData) {
      try {
        const user = JSON.parse(userData); // Parse user data from JSON

        const role = user.role; // user or employer

        // Get allowed roles from route data (if any)
        const allowedRoles = route.data?.['roles'] as string[] | undefined;

        // If route restricts roles and user's role is not allowed, redirect accordingly
        if (allowedRoles && !allowedRoles.includes(role)) {
          if (role === 'employer') return router.parseUrl('/employer/dashboard');
          if (role === 'user') return router.parseUrl('/user/dashboard');
          return router.parseUrl('/unauthorized'); // fallback redirect
        }

        // User is authenticated and authorized
        return true;
      } catch (err) {
        // If user data is corrupted, redirect to login
        return router.parseUrl('/login');
      }
    }
  }

  // If not authenticated, redirect to login
  return router.parseUrl('/login');
};
