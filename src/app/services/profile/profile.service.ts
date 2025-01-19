import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = 'https://localhost:7293/api/UserManagement';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.baseUrl}/get-current-user-profile`
    );
  }

  updateUserProfile(userData: any): Observable<any> {
    console.log('From the edit method in service');
    console.log(userData);
    return this.http.put(`${this.baseUrl}/update-user`, userData).pipe(
      catchError((error) => {
        console.error('Error during updating:', error);
        if (error.status == 401) this.toastr.error('Unauthorized', 'error');
        else this.toastr.error(error.error!.error, 'error');
        return throwError(() => new error(error));
      })
    );
  }

  deleteUserProfile(userData: DeleteProfile): Observable<any> {
    return (
      this.http
        //pass the username and the refreshToke to the delete as a query params
        .delete(`${this.baseUrl}/delete-user`, {
          params: {
            userName: userData.userName,
            refreshToken: userData.refreshToken,
          },
        })
        .pipe(
          catchError((error) => {
            console.error('Error during deleting:', error);
            if (error.status == 401) this.toastr.error('Unauthorized', 'error');
            else this.toastr.error(error.error!.error, 'error');
            return throwError(() => new error(error));
          })
        )
    );
  }
}
