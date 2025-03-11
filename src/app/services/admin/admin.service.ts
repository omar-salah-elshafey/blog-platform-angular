import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UserProfile } from '../profile/profile.service';
import { PaginatedResponse } from '../shared.service';
import { CommentResponseModel } from '../comment/comment.service';
import { environment } from '../../environments/environment';

export interface ChangeUserRoleDto {
  userName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = `${environment.apiUrl}/api/Auth`;
  private userUrl = `${environment.apiUrl}/api/UserManagement`;
  private postUrl = `${environment.apiUrl}/api/Post`;
  private commentUrl = `${environment.apiUrl}/api/Comment`;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-user`, userData).pipe(
      tap((response) => {}),
      catchError((error) => {
        console.error('Error while Adding: ' + error);
        return throwError(() => error);
      })
    );
  }

  getAllUsers(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<UserProfile>> {
    return this.http
      .get<PaginatedResponse<UserProfile>>(`${this.userUrl}/get-all-users`, {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error while Getting Users: ', error);
          return throwError(() => error);
        })
      );
  }

  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.userUrl}/get-users-count`).pipe(
      catchError((error) => {
        console.error('Error Getting Users count', error);
        return throwError(() => error);
      })
    );
  }

  getPostsCount(): Observable<number> {
    return this.http.get<number>(`${this.postUrl}/get-posts-count`).pipe(
      catchError((error) => {
        console.error('Error Getting Posts count', error);
        return throwError(() => error);
      })
    );
  }

  getCommentsCount(): Observable<number> {
    return this.http.get<number>(`${this.commentUrl}/get-comments-count`).pipe(
      catchError((error) => {
        console.error('Error Getting Comments count', error);
        return throwError(() => error);
      })
    );
  }

  getAllComments(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<CommentResponseModel>> {
    return this.http
      .get<PaginatedResponse<CommentResponseModel>>(
        `${this.commentUrl}/get-all-comments`,
        {
          params: {
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
          },
        }
      )
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Getting comments data', error);
          return throwError(() => error);
        })
      );
  }

  changeRole(userData: ChangeUserRoleDto): Observable<any> {
    return this.http.put(`${this.userUrl}/change-role`, userData).pipe(
      catchError((error) => {
        console.error('Error Changing the role', error);
        return throwError(() => error);
      })
    );
  }
}
