// Angular route guard to protect routes based on authentication and user role
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// authGuard checks if the user is authenticated and authorized to access a route
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      const allowedRoles = route.parent?.data?.['roles'];

      if (allowedRoles && allowedRoles.includes(user.role)) {
        return true;
      }

      return router.parseUrl('/unauthorized');
    } catch {
      return router.parseUrl('/login');
    }
  }

  return router.parseUrl('/login');
};

