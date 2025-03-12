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
  sharedPostId?: number;
  sharerName?: string;
  originalPost?: PostResponseModel;
}

export interface PostDto {
  content: string;
  imageFile?: File;
  videoFile?: File;
}

export interface UpdatePostDto {
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
  private ngrokUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  private updateUrls(post: PostResponseModel): PostResponseModel {
    if (post.imageUrl) {
      post.imageUrl = post.imageUrl.replace('https://localhost', this.ngrokUrl);
    }
    if (post.videoUrl) {
      post.videoUrl = post.videoUrl.replace('https://localhost', this.ngrokUrl);
    }
    return post;
  }

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
        tap((response) => {
          response.items = response.items.map((post) => this.updateUrls(post));
        }),
        catchError((error) => {
          console.error('Error Getting Posts data', error);
          return throwError(() => error);
        })
      );
  }

  getPostById(id: number): Observable<PostResponseModel> {
    return this.http
      .get<PostResponseModel>(`${this.baseUrl}/get-post-by-id/${id}`)
      .pipe(
        tap((post) => this.updateUrls(post)),
        catchError((error) => {
          console.error('Error Getting post data', error);
          return throwError(() => error);
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
        tap((response) => {
          response.items = response.items.map((post) => this.updateUrls(post));
        }),
        catchError((error) => {
          console.error('Error Getting post data', error.error!.error);
          return throwError(() => error);
        })
      );
  }

  getUserFeed(
    userName: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<PostResponseModel>> {
    return this.http
      .get<PaginatedResponse<PostResponseModel>>(
        `${this.baseUrl}/get-user-feed/${userName}`,
        {
          params: {
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
          },
        }
      )
      .pipe(
        tap((response) => {
          response.items = response.items.map((post) => this.updateUrls(post));
        }),
        catchError((error) => {
          console.error('Error Getting user feed', error);
          return throwError(() => error);
        })
      );
  }

  getHomeFeed(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<PostResponseModel>> {
    return this.http
      .get<PaginatedResponse<PostResponseModel>>(
        `${this.baseUrl}/get-home-feed`,
        {
          params: {
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
          },
        }
      )
      .pipe(
        tap((response) => {
          response.items = response.items.map((post) => this.updateUrls(post));
        }),
        catchError((error) => {
          console.error('Error Getting home feed', error);
          return throwError(() => error);
        })
      );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-post/${id}`).pipe(
      catchError((error) => {
        console.error('Error Deleting the Post', error);
        return throwError(() => error);
      })
    );
  }

  updatePost(
    id: number,
    postDto: UpdatePostDto
  ): Observable<PostResponseModel> {
    const formData = new FormData();
    formData.append('content', postDto.content);
    if (postDto.imageFile) formData.append('imageFile', postDto.imageFile);
    if (postDto.videoFile) formData.append('videoFile', postDto.videoFile);
    if (postDto.deleteImage) formData.append('deleteImage', 'true');
    if (postDto.deleteVideo) formData.append('deleteVideo', 'true');
    return this.http
      .put<PostResponseModel>(`${this.baseUrl}/update-post/${id}`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error Updating the Post', error);
          return throwError(() => error);
        })
      );
  }

  addPost(postDto: PostDto): Observable<PostResponseModel> {
    const formData = new FormData();
    formData.append('content', postDto.content);
    if (postDto.imageFile) formData.append('imageFile', postDto.imageFile);
    if (postDto.videoFile) formData.append('videoFile', postDto.videoFile);
    return this.http
      .post<PostResponseModel>(`${this.baseUrl}/create-post`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error Creating the Post', error);
          return throwError(() => error);
        })
      );
  }

  sharePost(postId: number): Observable<PostResponseModel> {
    return this.http
      .post<PostResponseModel>(`${this.baseUrl}/share-post/${postId}`, {})
      .pipe(
        tap((post) => this.updateUrls(post)),
        catchError((error) => {
          console.error('Error sharing post', error);
          return throwError(() => error);
        })
      );
  }
}
