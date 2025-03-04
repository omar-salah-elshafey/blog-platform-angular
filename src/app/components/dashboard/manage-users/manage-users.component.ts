import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ProfileService,
  UserProfile,
} from '../../../services/profile/profile.service';
import {
  AdminService,
  ChangeUserRoleDto,
} from '../../../services/admin/admin.service';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-users',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent implements OnInit {
  loading = false;
  users: UserProfile[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  userForms: {
    [userName: string]: { firstName: string; lastName: string; role: string };
  } = {};
  profileUpdateState: { [userId: string]: boolean } = {};
  roleChangeState: { [userId: string]: boolean } = {};

  roles = ['Admin', 'Writer', 'Reader'];
  constructor(
    private adminService: AdminService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private cookieService: CookieService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.loading = true;
    this.adminService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = [...this.users, ...response.items];
        this.users.forEach((user) => {
          this.userForms[user.userName] = {
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };
          this.profileUpdateState[user.userName] = false;
          this.roleChangeState[user.userName] = false;
        });
        this.loading = false;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        this.toastr.error(
          'Error fetching results, please try again later.',
          'Error'
        );
        console.error('Error:', error);
        this.loading = false;
      },
    });
  }

  loadMoreUsers() {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.getAllUsers();
    }
  }

  onChangeRole(user: UserProfile) {
    this.roleChangeState[user.userName] = true;
  }

  cancelRoleChange(user: UserProfile) {
    this.roleChangeState[user.userName] = false;
    this.userForms[user.userName].role = user.role;
  }

  saveRole(user: UserProfile) {
    const updatedRole = this.userForms[user.userName].role;

    if (updatedRole === user.role) {
      this.toastr.info('User is already assigned to this role.', 'Info');
      this.cancelRoleChange(user);
      return;
    }

    const userData: ChangeUserRoleDto = {
      userName: user.userName,
      role: updatedRole,
    };

    this.adminService.changeRole(userData).subscribe({
      next: (response) => {
        this.toastr.success(response.message, 'Success');
        user.role = updatedRole;
        this.cancelRoleChange(user);
      },
      error: (error) => {
        this.toastr.error(error.error!.error, 'Error');
        console.error('Error:', error);
      },
    });
  }

  toggleEditMode(user: UserProfile) {
    this.profileUpdateState[user.userName] = true;
  }

  cancelProfileUpdate(user: UserProfile) {
    this.profileUpdateState[user.userName] = false;
    this.userForms[user.userName].firstName = user.firstName;
    this.userForms[user.userName].lastName = user.lastName;
  }

  saveProfileUpdate(user: UserProfile) {
    const updatedFirstName = this.userForms[user.userName].firstName;
    const updatedLastName = this.userForms[user.userName].lastName;

    if (
      updatedFirstName === user.firstName &&
      updatedLastName === user.lastName
    ) {
      this.toastr.info('No changes detected in the profile.', 'Info');
      this.cancelProfileUpdate(user);
      return;
    }

    const updatedProfile = {
      userName: user.userName,
      firstName: updatedFirstName,
      lastName: updatedLastName,
    };

    this.profileService.updateUserProfile(updatedProfile).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully.', 'Success');
        user.firstName = updatedFirstName;
        user.lastName = updatedLastName;
        this.profileUpdateState[user.userName] = false;
      },
      error: (error) => {
        this.toastr.error('Error updating profile.', 'Error');
      },
    });
  }

  onDeleteAccount(userName: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        const userData = {
          userName: userName,
          refreshToken: this.cookieService.get('refreshToken'),
        };
        this.profileService.deleteUserProfile(userData).subscribe({
          next: (response) => {
            this.toastr.success('Profile deleted successfully.', 'Success');
            this.users = this.users.filter(
              (user) => user.userName !== userName
            );
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
}
