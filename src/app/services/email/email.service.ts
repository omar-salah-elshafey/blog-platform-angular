import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private baseUrl = `${environment.apiUrl}/api/Email/`;

  constructor(private http: HttpClient) {}

  confirmEmail(confirmEmailDto: { Email: string; Token: string }) {
    return this.http.post(`${this.baseUrl}confirm-email`, confirmEmailDto);
  }

  resendConfirmationEmail(email: string) {
    return this.http.post(
      `${this.baseUrl}resend-confirmation-email?Email=${email}`,
      {}
    );
  }
}
