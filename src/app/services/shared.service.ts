import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from './profile/profile.service';
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor() {}

  setUserProfile(profile: UserProfile): void {
    this.userProfileSubject.next(profile);
  }

  getUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  clearUserProfile(): void {
    this.userProfileSubject.next(null);
  }
}
