import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';
export interface ChangePasswordDto {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private baseUrl = 'https://localhost:7293/api/PasswordManager/';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  resetPasswordRequest(email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}reset-password-request?email=${email}`,
      {}
    );
  }

  verifyResetPasswordToken(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}verify-password-reset-token`,
      userData
    );
  }

  resetPassword(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}reset-password`, userData);
  }

  changePassword(userData: ChangePasswordDto): Observable<any> {
    return this.http.put(`${this.baseUrl}change-password`, userData).pipe(
      catchError((error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error Changing the Password:', error);
        return throwError(() => new error(error));
      })
    );
  }
}
