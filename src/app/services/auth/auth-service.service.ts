import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://localhost:7293/api/Auth';

  constructor(private http: HttpClient) {}

  //register
  registerReader(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-reader`, userData, {
      responseType: 'text',
    });
  }

  //login
  login(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, userData);
  }
}
