import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const reouter = inject(Router)
  if (authService.isLoggedIn) return true;
  else {
    reouter.navigateByUrl('/login');
    return false;
  }
};
