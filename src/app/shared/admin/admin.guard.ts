import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../../services/profile/profile.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const profileService = inject(ProfileService);
  if (profileService.isAdmin()) return true;
  else {
    router.navigateByUrl('/home');
    return false;
  }
};
