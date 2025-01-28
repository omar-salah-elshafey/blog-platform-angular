import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  catchError,
  switchMap,
  of,
  EMPTY,
  throwError,
  BehaviorSubject,
  filter,
  take,
} from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const accessToken = cookieService.get('accessToken');
  const refreshToken = cookieService.get('refreshToken');

  let isRefreshing = false;
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);

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
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshAccessToken(refreshToken).pipe(
            switchMap((newTokens) => {
              console.log('Token successfully refreshed:', newTokens);

              cookieService.set('accessToken', newTokens.accessToken, 1, '/');
              cookieService.set('refreshToken', newTokens.refreshToken, 1, '/');

              isRefreshing = false;
              refreshTokenSubject.next(newTokens.accessToken);

              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newTokens.accessToken}`,
                },
              });
              return next(req);
            }),
            catchError((refreshError) => {
              console.error('Error during token refresh:', refreshError);

              isRefreshing = false;

              cookieService.delete('accessToken', '/');
              cookieService.delete('refreshToken', '/');
              router.navigate(['/login']);
              toastr.warning('Session expired, please login again.', 'Warning');

              return EMPTY;
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) => {
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return next(req);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
