import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  UserProfile,
  ProfileService,
  UpdateProfile,
} from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loading = true;
  updateMode = false;
  updateProfileForm!: FormGroup;
  updatedProfile: UpdateProfile | null = null;

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService,
    private fb: FormBuilder
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

  initializeForm(profile: UserProfile): void {
    this.updateProfileForm = this.fb.group({
      firstName: [
        profile.firstName,
        [Validators.required, Validators.minLength(3)],
      ],
      lastName: [
        profile.lastName,
        [Validators.required, Validators.minLength(3)],
      ],
    });
  }

  toggleEditForm() {
    this.updateMode = true;
    this.initializeForm(this.userProfile!);
  }
  cancelEditForm() {
    this.updateMode = false;
  }
  onUpdateProfile() {
    throw new Error('Method not implemented.');
  }
}
