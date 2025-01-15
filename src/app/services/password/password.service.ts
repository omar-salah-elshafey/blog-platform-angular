import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private baseUrl = 'https://localhost:7293/api/PasswordManager/';

  constructor(private http: HttpClient) {}

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
    return this.http.post(`${this.baseUrl}reset-password`, userData);
  }
}
