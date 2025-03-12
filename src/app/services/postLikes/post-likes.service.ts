import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';

export interface PostLikeDto {
  id: number;
  postId: number;
  userId: string;
  userName: string;
  likedDate: Date;
  fullName: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostLikesService {
  private baseUrl = `${environment.apiUrl}/api/PostLikes`;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  toggleLike(postId: number): Observable<PostLikeDto[]> {
    return this.http
      .post<PostLikeDto[]>(`${this.baseUrl}/${postId}/toggle-like`, {})
      .pipe(
        catchError((error) => {
          console.error('Error toggling likes: ', error);
          return throwError(() => error);
        })
      );
  }

  getPostLikes(postId: number): Observable<PostLikeDto[]> {
    return this.http.get<PostLikeDto[]>(`${this.baseUrl}/${postId}/likes`).pipe(
      catchError((error) => {
        console.error('Error fetching likes: ', error);
        return throwError(() => error);
      })
    );
  }
}
