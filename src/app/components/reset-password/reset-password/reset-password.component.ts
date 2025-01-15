import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PasswordService } from '../../../services/password/password.service';

@Component({
  selector: 'app-reset-password',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  ResetPasswordForm!: FormGroup;
  showPassword: boolean = false;

  resetEmail = sessionStorage.getItem('resetEmail');
  resetToken = sessionStorage.getItem('resetToken');

  constructor(
    private formBuilder: FormBuilder,
    private passwordService: PasswordService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.ResetPasswordForm = this.formBuilder.group(
      {
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    const userData = {
      email: this.resetEmail,
      token: this.resetToken,
      newPassword: this.ResetPasswordForm.get('password')?.value,
      confirmNewPassword: this.ResetPasswordForm.get('confirmPassword')?.value,
    };
    console.log(userData);
    this.passwordService.resetPassword(userData).subscribe({
      next: (response) => {
        this.toastr.success('Password reset successfully', 'Success');
        this.ResetPasswordForm.reset();
        console.log('Password Reseted Succesfully' + response.response);
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error Reseting the Password', error);
        this.toastr.error(error.error?.error, 'Error');
        if (error.status == 400)
          this.router.navigate(['/varify-reset-password-token']);
      },
    });
  }
}
