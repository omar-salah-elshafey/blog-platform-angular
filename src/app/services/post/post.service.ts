import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { PaginatedResponse } from '../shared.service';
import { environment } from '../../environments/environment';

export interface PostCommentsModel {
  commentId: number;
  userName: string;
  content: string;
  createdDate: string;
}

export interface PostResponseModel {
  id: number;
  authorName: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdDate: string;
  modifiedDate?: string;
  comments: PostCommentsModel[];
  showComments?: boolean;
}

export interface PostDto {
  title: string;
  content: string;
  imageFile?: File;
  videoFile?: File;
}

export interface UpdatePostDto {
  title: string;
  content: string;
  imageFile?: File;
  videoFile?: File;
  deleteImage?: boolean;
  deleteVideo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private baseUrl = `${environment.apiUrl}/api/Post`;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  getAllPosts(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<PostResponseModel>> {
    return this.http
      .get<PaginatedResponse<PostResponseModel>>(
        `${this.baseUrl}/get-all-posts`,
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
          console.error('Error Getting Posts data', error);
          return throwError(() => new error(error));
        })
      );
  }

  getPostById(id: number): Observable<PostResponseModel> {
    return this.http
      .get<PostResponseModel>(`${this.baseUrl}/get-post-by-id/${id}`)
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Getting post data', error);
          return throwError(() => new error(error));
        })
      );
  }

  getPostsByUser(
    userName: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<PostResponseModel>> {
    return this.http
      .get<PaginatedResponse<PostResponseModel>>(
        `${this.baseUrl}/get-posts-by-user/${userName}`,
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
          console.error('Error Getting post data', error);
          return throwError(() => new error(error));
        })
      );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-post/${id}`).pipe(
      catchError((error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error Deleting the Post', error);
        return throwError(() => new error(error));
      })
    );
  }

  updatePost(
    id: number,
    postDto: UpdatePostDto
  ): Observable<PostResponseModel> {
    const formData = new FormData();
    formData.append('title', postDto.title);
    formData.append('content', postDto.content);
    if (postDto.imageFile) formData.append('imageFile', postDto.imageFile);
    if (postDto.videoFile) formData.append('videoFile', postDto.videoFile);
    if (postDto.deleteImage) formData.append('deleteImage', 'true');
    if (postDto.deleteVideo) formData.append('deleteVideo', 'true');
    return this.http
      .put<PostResponseModel>(`${this.baseUrl}/update-post/${id}`, formData)
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Updating the Post', error);
          return throwError(() => new error(error));
        })
      );
  }

  addPost(postDto: PostDto): Observable<PostResponseModel> {
    const formData = new FormData();
    formData.append('title', postDto.title);
    formData.append('content', postDto.content);
    if (postDto.imageFile) formData.append('imageFile', postDto.imageFile);
    if (postDto.videoFile) formData.append('videoFile', postDto.videoFile);
    return this.http
      .post<PostResponseModel>(`${this.baseUrl}/create-post`, formData)
      .pipe(
        catchError((error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Error Creating the Post', error);
          return throwError(() => new error(error));
        })
      );
  }
}
