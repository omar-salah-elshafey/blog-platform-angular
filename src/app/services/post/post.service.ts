import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';

export interface PostCommentsModel {
  commentId: number;
  userName: string;
  content: string;
  createdDate: string;
}

export interface PostResponseModel {
  id: number;
  authorName: string;
  title: string;
  content: string;
  createdDate: string;
  modifiedDate?: string;
  comments: PostCommentsModel[];
  showComments?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private baseUrl = 'https://localhost:7293/api/Post';
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  getAllPosts(): Observable<PostResponseModel[]> {
    return this.http.get<PostResponseModel[]>(`${this.baseUrl}/get-all-posts`);
  }

  getPostById(id: number): Observable<PostResponseModel> {
    return this.http
      .get<PostResponseModel>(`${this.baseUrl}/get-post-by-id`, {
        params: { id: id.toString() },
      })
      .pipe(
        tap((response) => {
          console.log('Getting post data: ', response);
          this.toastr.info('Getting post data...', 'info');
        }),
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Getting post data', error);
          return throwError(() => new error(error));
        })
      );
  }

  getPostsByUser(userName: string): Observable<PostResponseModel[]> {
    return this.http
      .get<PostResponseModel[]>(`${this.baseUrl}/get-posts-by-user`, {
        params: { userName },
      })
      .pipe(
        tap((response) => {
          console.log('Getting posts data: ', response);
          this.toastr.info('Getting post data...', 'info');
        }),
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Getting post data', error);
          return throwError(() => new error(error));
        })
      );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-post?id=${id}`).pipe(
      tap((response) => {
        console.log('Deleting the Post', response);
        this.toastr.info('Deleting the Post...', 'info');
      }),
      catchError((error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error Deleting the Post', error);
        return throwError(() => new error(error));
      })
    );
  }
}
