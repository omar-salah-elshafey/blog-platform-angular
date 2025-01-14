import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private baseUrl = 'https://localhost:7293/api/Email/';

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
