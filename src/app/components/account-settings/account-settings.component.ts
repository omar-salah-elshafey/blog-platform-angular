import { Component, OnInit } from '@angular/core';
import {
  ProfileService,
  UpdateProfile,
  UserProfile,
} from '../../services/profile/profile.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../services/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { PasswordService } from '../../services/password/password.service';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent implements OnInit {
  updateMode = false;
  changePasswordMode = false;
  isProfileLoading = false;
  updateProfileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  updatedProfile: UpdateProfile | null = null;
  userProfile: UserProfile | null = null;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private cookieService: CookieService,
    private router: Router,
    private dialog: MatDialog,
    private passwordService: PasswordService
  ) {}

  ngOnInit(): void {
    this.sharedService.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userProfile = { ...this.userProfile, ...profile };
      }
    });

    const cachedProfile = this.sharedService.getUserProfile();
    if (!cachedProfile) {
      this.fetchUserProfile();
    } else {
      this.userProfile = cachedProfile;
    }
  }

  fetchUserProfile(): void {
    this.isProfileLoading = true;
    this.profileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.sharedService.setUserProfile(profile);
      },
      error: (error) => {
        this.toastr.error(
          'Failed to fetch user profile. Please try again later.',
          'Error'
        );
        console.error('Error fetching user profile:', error);
      },
      complete: () => {
        this.isProfileLoading = false;
      },
    });
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
    console.log('From the edit method in component');
    const userData = {
      userName: this.profileService.getUserNameFromToken(),
      firstName: this.updateProfileForm.get('firstName')?.value.trim(),
      lastName: this.updateProfileForm.get('lastName')?.value.trim(),
    };
    console.log(userData);
    this.profileService.updateUserProfile(userData).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully.', 'Success');
        this.updateMode = false;

        console.log('profile updated! ', response);
        const updatedProfile: UserProfile = {
          ...this.userProfile!,
          firstName: userData.firstName,
          lastName: userData.lastName,
        };
        this.sharedService.setUserProfile(updatedProfile);
      },
      error: (error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error updating user profile:', error);
      },
    });
  }

  onDeleteProfile() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        const userData = {
          userName: this.userProfile!.userName,
          refreshToken: this.cookieService.get('refreshToken'),
        };
        console.log(userData);
        this.profileService.deleteUserProfile(userData).subscribe({
          next: (response) => {
            this.toastr.success('Profile deleted successfully.', 'Success');
            console.log('Profile Deleted!: ', response);
            this.sharedService.clearUserProfile();
            this.cookieService.delete('refreshToken');
            this.cookieService.delete('accessToken');
            this.router.navigate(['/login']);
          },
          error: (error: any) => {
            this.toastr.error(error.error!.error, 'Error');
            console.error('Error deleting user profile:', error);
          },
        });
      } else {
        console.log('User canceled account deletion');
      }
    });
  }

  initializeChangePasswordForm() {
    this.changePasswordForm = this.fb.group(
      {
        email: [
          this.profileService.getEmailFromToken(),
          [Validators.email, Validators.required],
        ],
        oldPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmNewPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: AbstractControl): void | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    if (newPassword !== confirmNewPassword) {
      form.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmNewPassword')?.setErrors(null);
    }
  }

  onChangePassword() {
    this.changePasswordMode = true;
    this.initializeChangePasswordForm();
  }

  onSubmitChangePassword() {
    if (this.changePasswordForm.invalid) {
      this.toastr.error('Please fill out the form correctly.', 'Error');
      return;
    }
    const trimmedFormValue = {
      email: this.profileService.getEmailFromToken(),
      currentPassword: this.changePasswordForm.value.oldPassword.trim(),
      newPassword: this.changePasswordForm.value.newPassword.trim(),
      confirmNewPassword:
        this.changePasswordForm.value.confirmNewPassword.trim(),
    };
    this.passwordService.changePassword(trimmedFormValue).subscribe({
      next: (response) => {
        console.log('Password changed successfully:', response);
        this.toastr.success('Password changed successfully!', 'Success');
        this.changePasswordMode = false;
      },
      error: (error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Password changing failed:', error.error);
      },
    });
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'oldPassword') {
      this.showOldPassword = !this.showOldPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmNewPassword') {
      this.showConfirmNewPassword = !this.showConfirmNewPassword;
    }
  }

  cancelchangePasswordForm() {
    this.changePasswordMode = false;
  }
}
