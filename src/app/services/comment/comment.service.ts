import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { PaginatedResponse } from '../shared.service';
import { environment } from '../../environments/environment';

export interface CommentDto {
  PostId: number;
  Content: string;
}
export interface CommentResponseModel {
  id: number;
  postId: number;
  userName: string;
  content: string;
  createdDate: string;
}
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private baseUrl = `${environment.apiUrl}/api/Comment`;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  addComment(commentDto: CommentDto): Observable<CommentResponseModel> {
    return this.http
      .post<CommentResponseModel>(`${this.baseUrl}/add-comment`, commentDto)
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Creating the comment!', error);
          return throwError(() => new error(error));
        })
      );
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-comment/${id}`).pipe(
      catchError((error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error Deleted the comment!', error);
        return throwError(() => new error(error));
      })
    );
  }

  updateComment(
    id: number,
    commentData: CommentDto
  ): Observable<CommentResponseModel> {
    return this.http
      .put<CommentResponseModel>(
        `${this.baseUrl}/update-comment/${id}`,
        commentData
      )
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Updating the comment!', error);
          return throwError(() => new error(error));
        })
      );
  }

  getCommentsByPostId(
    postId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<CommentResponseModel>> {
    return this.http
      .get<PaginatedResponse<CommentResponseModel>>(
        `${this.baseUrl}/get-comments-by-post/${postId}`,
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
          return throwError(() => new error(error));
        })
      );
  }

  getCommentsByUser(
    userName: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<CommentResponseModel>> {
    return this.http
      .get<PaginatedResponse<CommentResponseModel>>(
        `${this.baseUrl}/get-comments-by-user/${userName}`,
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
          return throwError(() => new error(error));
        })
      );
  }
}
