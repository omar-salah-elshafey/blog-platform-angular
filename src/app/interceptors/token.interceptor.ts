import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, switchMap, throwError, BehaviorSubject, from } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

let refreshPromise: Promise<string | null> | null = null;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  let accessToken = cookieService.get('accessToken');

  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      const refreshToken = cookieService.get('refreshToken');
      if (error.status === 401 && refreshToken) {
        if (!refreshPromise) {
          refreshPromise = firstValueFrom(
            authService.refreshAccessToken(refreshToken)
          )
            .then((newTokens) => {
              cookieService.set(
                'accessToken',
                newTokens.accessToken,
                1,
                '/',
                undefined,
                true,
                'Strict'
              );
              cookieService.set(
                'refreshToken',
                newTokens.refreshToken,
                1,
                '/',
                undefined,
                true,
                'Strict'
              );
              refreshTokenSubject.next(newTokens.refreshToken);
              return newTokens.accessToken;
            })
            .catch((refreshError) => {
              console.error(
                `[${new Date().toISOString()}] Error during token refresh:`,
                refreshError
              );
              cookieService.delete('accessToken', '/');
              cookieService.delete('refreshToken', '/');
              router.navigate(['/login']);
              toastr.warning('Session expired, please login again.', 'Warning');
              return null;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        return from(refreshPromise).pipe(
          switchMap((newAccessToken) => {
            if (!newAccessToken) {
              return throwError(() => new Error('Token refresh failed'));
            }
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
                'ngrok-skip-browser-warning': 'true',
              },
            });
            return next(req);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
