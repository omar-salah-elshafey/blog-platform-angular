import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UserProfile } from '../profile/profile.service';
import { PaginatedResponse } from '../shared.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'https://localhost:7293/api/Auth';
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) {}

  registerAdmin(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-admin`, userData).pipe(
      tap((response) => {
        console.log('User registered successfully: ', response);
      }),
      catchError((error) => {
        console.error('Error while registering: ' + error);
        return throwError(() => error);
      })
    );
  }

  getAllUsers(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<UserProfile>> {
    return this.http
      .get<PaginatedResponse<UserProfile>>(`${this.baseUrl}/get-all-users`, {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      })
      .pipe(
        tap((response) => {
          console.log('Getting Users: ', response);
        }),
        catchError((error) => {
          console.error('Error while Getting Users: ', error);
          return throwError(() => error);
        })
      );
  }
}
