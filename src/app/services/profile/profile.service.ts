import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { PaginatedResponse } from '../shared.service';
import { environment } from '../../environments/environment';

export interface UserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
}

export interface UpdateProfile {
  userName: string;
  firstName: string;
  lastName: string;
}

export interface DeleteProfile {
  userName: string;
  refreshToken: string;
  password?: string;
}

interface JwtPayload {
  name: string;
  roles: any;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = `${environment.apiUrl}/api/UserManagement`;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private cookieService: CookieService
  ) {}

  getUserNameFromToken(): string | null {
    const token = this.cookieService.get('accessToken');
    if (!token) {
      console.error('No token found');
      return null;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.name;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUserRoleFromToken(): string | null {
    const token = this.cookieService.get('accessToken');
    if (!token) {
      console.error('No token found');
      return null;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.roles.toLowerCase();
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isAdmin() {
    const role = this.getCurrentUserRoleFromToken();
    return role === 'admin' || role === 'superadmin';
  }

  getEmailFromToken(): string {
    const token = this.cookieService.get('accessToken');
    if (!token) {
      console.error('No token found');
      return '';
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.email;
    } catch (error) {
      console.error('Error decoding token:', error);
      return '';
    }
  }

  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.baseUrl}/get-current-user-profile`
    );
  }

  getUserProfile(userName: string) {
    return this.http
      .get<UserProfile>(`${this.baseUrl}/get-user-profile/${userName}`)
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Getting User Profile');
          return throwError(() => error);
        })
      );
  }

  updateUserProfile(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-user`, userData).pipe(
      catchError((error) => {
        console.error('Error during updating:', error);
        if (error.status == 401) this.toastr.error('Unauthorized', 'error');
        else this.toastr.error(error.error!.error, 'error');
        return throwError(() => error);
      })
    );
  }

  deleteUserProfile(userData: DeleteProfile): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/delete-user`, { body: userData })
      .pipe(
        catchError((error) => {
          console.error('Error deleting user profile:', error);
          return throwError(() => error);
        })
      );
  }

  searchUsers(
    query: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<UserProfile>> {
    return this.http
      .get<PaginatedResponse<UserProfile>>(`${this.baseUrl}/search-users`, {
        params: {
          query,
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error during searching:', error);
          return throwError(() => error);
        })
      );
  }
}
