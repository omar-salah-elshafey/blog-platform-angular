import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserProfile, ProfileService } from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loading = true;

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.profileService.getCurrentUserProfile().subscribe(
      (profile) => {
        this.userProfile = profile;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.toastr.error(
          'Failed to fetch user profile. Please try again later.',
          'Error'
        );
        console.error('Error fetching user profile:', error);
      }
    );
  }
}
