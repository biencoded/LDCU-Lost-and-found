import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Check session before redirecting
  return authService.checkSession().pipe(
    switchMap((session: any) => {
      if (session.authenticated) {
        return of(true);
      }
      router.navigate(['/login'], {
        queryParams: { redirectUrl: state.url },
      });
      return of(false);
    })
  );
};
