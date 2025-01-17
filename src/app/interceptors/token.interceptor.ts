import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, switchMap, of } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const authService = inject(AuthService);

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
        // If the request fails with 401 Unauthorized, try to refresh the token
        return authService.refreshAccessToken(refreshToken).pipe(
          switchMap((newTokens) => {
            cookieService.set('accessToken', newTokens.accessToken, 1, '/');
            cookieService.set('refreshToken', newTokens.refreshToken, 1, '/');
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newTokens.accessToken}`,
              },
            });
            return next(req);
          }),
          catchError((refreshError) => {
            authService.logout();
            return of(refreshError);
          })
        );
      }
      return of(error);
    })
  );
};
