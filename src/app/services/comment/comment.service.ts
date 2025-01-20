import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';

export interface CommentDto {
  PostId: number;
  Content: string;
}
export interface CommentResponseModel {
  Id: number;
  PostId: number;
  UserName: string;
  Content: string;
  createdDate: string;
}
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private baseUrl = 'https://localhost:7293/api/Comment';
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  addComment(commentDto: CommentDto): Observable<CommentResponseModel> {
    return this.http
      .post<CommentResponseModel>(`${this.baseUrl}/add-comment`, commentDto)
      .pipe(
        tap((response) => {
          console.log('Comment Created: ', response);
          this.toastr.info('Comment Created...', 'info');
        }),
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Creating the comment!', error);
          return throwError(() => new error(error));
        })
      );
  }

  deleteComment(id: number): Observable<any>{
    return this.http.delete(`${this.baseUrl}/delete-comment`).pipe(
      tap((response) => {
        console.log('Comment Deleted: ', response);
        this.toastr.info('Comment Deleted...', 'info');
      }),
      catchError((error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error Deleted the comment!', error);
        return throwError(() => new error(error));
      })
    );
  }
}
