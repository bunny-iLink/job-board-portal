import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user'); // store user info as JSON

    if (token && userData) {
      try {
        const user = JSON.parse(userData);

        const role = user.role; // user or employer

        const allowedRoles = route.data?.['roles'] as string[] | undefined;

        if (allowedRoles && !allowedRoles.includes(role)) {
          if (role === 'employer') return router.parseUrl('/employer/dashboard');
          if (role === 'user') return router.parseUrl('/user/dashboard');
          return router.parseUrl('/unauthorized'); // or redirect to their dashboard
        }

        return true;
      } catch (err) {
        return router.parseUrl('/login');
      }
    }
  }

  return router.parseUrl('/login');
};
