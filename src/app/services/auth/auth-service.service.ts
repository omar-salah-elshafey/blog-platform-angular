import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://localhost:7293/api/Auth';
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  // private refreshTimer: any;
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) {}

  private setTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set(
      'accessToken',
      accessToken,
      1,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'refreshToken',
      encodeURIComponent(refreshToken),
      1,
      '/',
      '',
      true,
      'Strict'
    );
    this.accessTokenSubject.next(accessToken);
  }

  // Get access token from the cookies
  getAccessToken(): string | null {
    return (
      this.accessTokenSubject.value || this.cookieService.get('accessToken')
    );
  }

  //register
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-user`, userData).pipe(
      tap((response) => {
        console.log('User registered successfully: ', response);
      }),
      catchError((error) => {
        console.error('Error while registering: ' + error);
        return throwError(() => error);
      })
    );
  }

  //login
  login(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, userData).pipe(
      tap((response: any) => {
        this.setTokens(response.accessToken, response.refreshToken);
        // this.startTokenRefreshScheduler();
      }),
      catchError((error) => {
        console.error('Error while logging in: ' + error);
        return throwError(() => error);
      })
    );
  }

  isLoggedIn() {
    return this.cookieService.check('accessToken');
  }

  // Refresh the token
  refreshAccessToken(refreshToken: string) {
    return this.http
      .get<any>(`${this.baseUrl}/refreshtoken?refreshToken=${refreshToken}`)
      .pipe(
        catchError((error) => {
          console.error('Token refresh failed:', error);
          return throwError(() => new error(error));
        })
      );
  }

  // private startTokenRefreshScheduler() {
  //   const refreshTime = 8 * 60 * 1000;

  //   if (this.refreshTimer) {
  //     clearTimeout(this.refreshTimer);
  //   }

  //   this.refreshTimer = setTimeout(() => {
  //     const refreshToken = this.cookieService.get('refreshToken');
  //     if (refreshToken) {
  //       this.refreshAccessToken(refreshToken).subscribe({
  //         next: () => {
  //           this.startTokenRefreshScheduler();
  //         },
  //         error: () => {
  //           this.toastr.error('Session expired, please log in again.');
  //           this.logout().subscribe(() => {});
  //         },
  //       });
  //     } else {
  //       this.logout().subscribe(() => {
  //         this.toastr.error('Session expired, please log in again.');
  //       });
  //     }
  //   }, refreshTime);
  // }

  // initializeSession() {
  //   this.startTokenRefreshScheduler();
  // }

  //logout
  logout(): Observable<any> {
    const refreshToken = this.cookieService.get('refreshToken');
    return this.http
      .post(`${this.baseUrl}/logout?refreshToken=${refreshToken}`, {})
      .pipe(
        tap(() => {
          this.cookieService.delete('accessToken', '/');
          this.cookieService.delete('refreshToken', '/');
          this.accessTokenSubject.next(null);
        }),
        catchError((error) => {
          console.error('Error during logout:', error);
          if (error.status == 401) this.toastr.error('Unauthorized', 'error');
          else this.toastr.error(error.error!.error, 'error');
          return throwError(() => new error(error));
        })
      );
  }
}
