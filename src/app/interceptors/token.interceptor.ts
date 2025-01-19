import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, switchMap, of, EMPTY, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const accessToken = cookieService.get('accessToken');
  const refreshToken = cookieService.get('refreshToken');

  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && refreshToken) {
        return authService.refreshAccessToken(refreshToken).pipe(
          switchMap((newTokens) => {
            console.log('SwitchMap executing with new tokens', newTokens);
            cookieService.set('accessToken', newTokens.accessToken, 1, '/');
            cookieService.set('refreshToken', newTokens.refreshToken, 1, '/');
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newTokens.accessToken}`,
              },
            });
            return next(req);
          }),
          catchError((error) => {
            console.error('error in refreshing from the interceptor', error);
            cookieService.delete('accessToken', '/');
            cookieService.delete('refreshToken', '/');
            router.navigate(['/login']);
            toastr.warning('session expired, please login again.', 'warning');
            return EMPTY;
          })
        );
      }
      return throwError(() => error);
    })
  );
};
