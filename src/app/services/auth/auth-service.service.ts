import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://localhost:7293/api/Auth';
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  //register
  registerReader(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-reader`, userData, {
      responseType: 'text',
    });
  }

  //login
  login(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, userData);
  }

  isLoggedIn() {
    return this.cookieService.check('accessToken');
  }

  //logout
  logout(): Observable<any> {
    const accessToken = this.cookieService.get('accessToken');
    const refreshToken = this.cookieService.get('refreshToken');
    // console.log('refreshToken From Service: ', refreshToken);
    console.log('From Service: ', accessToken.trim());
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    console.log('from service: ', headers);
    return this.http
      .post(
        `${this.baseUrl}/logout?refreshToken=${refreshToken}`,
        {},
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Error during logout:', error);
          return throwError(error);
        })
      );
  }
}
