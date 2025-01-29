import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UserProfile } from '../profile/profile.service';
import { PaginatedResponse } from '../shared.service';
import { CommentResponseModel } from '../comment/comment.service';

export interface ChangeUserRoleDto {
  userName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'https://localhost:7293/api/Auth';
  private userUrl = 'https://localhost:7293/api/UserManagement';
  private postUrl = 'https://localhost:7293/api/Post';
  private commentUrl = 'https://localhost:7293/api/Comment';
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-user`, userData).pipe(
      tap((response) => {
        console.log('User Added successfully: ', response);
      }),
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
        tap((response) => {
          console.log('Getting Users: ', response);
        }),
        catchError((error) => {
          console.error('Error while Getting Users: ', error);
          return throwError(() => error);
        })
      );
  }

  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.userUrl}/get-users-count`).pipe(
      tap((response) => {
        console.log('Getting Users count: ', response);
      }),
      catchError((error) => {
        console.error('Error Getting Users count', error);
        return throwError(() => new error(error));
      })
    );
  }

  getPostsCount(): Observable<number> {
    return this.http.get<number>(`${this.postUrl}/get-posts-count`).pipe(
      tap((response) => {
        console.log('Getting Posts count: ', response);
      }),
      catchError((error) => {
        console.error('Error Getting Posts count', error);
        return throwError(() => new error(error));
      })
    );
  }

  getCommentsCount(): Observable<number> {
    return this.http.get<number>(`${this.commentUrl}/get-comments-count`).pipe(
      tap((response) => {
        console.log('Getting Comments count: ', response);
      }),
      catchError((error) => {
        console.error('Error Getting Comments count', error);
        return throwError(() => new error(error));
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
        tap((response) => {
          console.log('Getting comments data: ', response);
        }),
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Getting comments data', error);
          return throwError(() => new error(error));
        })
      );
  }

  changeRole(userData: ChangeUserRoleDto): Observable<any> {
    return this.http.put(`${this.userUrl}/change-role`, userData).pipe(
      tap((response) => {
        console.log('Changing the role: ', response);
      }),
      catchError((error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error Changing the role', error);
        return throwError(() => new error(error));
      })
    );
  }
}
