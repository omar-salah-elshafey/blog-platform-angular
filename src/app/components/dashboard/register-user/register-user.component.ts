import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../../services/admin/admin.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileService } from '../../../services/profile/profile.service';

@Component({
  selector: 'app-register-user',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.scss',
})
export class RegisterUserComponent implements OnInit {
  addUserForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmNewPassword = false;
  isLoading = false;
  isSuperAdmin = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private adminService: AdminService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.addUserForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(3)]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
    this.isSuperAdmin =
      this.profileService.getCurrentUserRoleFromToken() === 'superadmin';
  }

  passwordMatchValidator(form: AbstractControl): void | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmNewPassword = !this.showConfirmNewPassword;
    }
  }

  onSubmit(): void {
    const trimmedFormValue = {
      firstName: this.addUserForm.value.firstName.trim(),
      lastName: this.addUserForm.value.lastName.trim(),
      username: this.addUserForm.value.username.trim(),
      email: this.addUserForm.value.email.trim(),
      role: this.addUserForm.value.role,
      password: this.addUserForm.value.password.trim(),
      confirmPassword: this.addUserForm.value.confirmPassword.trim(),
    };
    if (this.addUserForm.valid) {
      this.isLoading = true;
      this.adminService.addUser(trimmedFormValue).subscribe({
        next: (response) => {
          this.toastr.success('User was Added Succefully.', 'Success');
          this.addUserForm.reset();
          this.showConfirmNewPassword = false;
          this.showPassword = false;
        },
        error: (error) => {
          this.toastr.error(error.error!.error, 'Error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.toastr.warning('Please fill in all required fields.', 'Warning');
      console.error('Form Invalid');
    }
  }
}
