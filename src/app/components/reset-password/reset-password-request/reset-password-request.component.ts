import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PasswordService } from '../../../services/password/password.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password-request',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './reset-password-request.component.html',
  styleUrl: './reset-password-request.component.scss',
})
export class ResetPasswordRequestComponent {
  resetPasswordRequestForm!: FormGroup;
  tokenSent: boolean = false;
  loading = false;

  constructor(
    private passwordService: PasswordService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.resetPasswordRequestForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      token: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  onSendToken() {
    this.loading = true;
    this.passwordService
      .resetPasswordRequest(this.resetPasswordRequestForm.value.email)
      .subscribe({
        next: () => {
          this.tokenSent = true;
          this.loading = false;
          this.toastr.success('OTP sent to your email', 'Success');
        },
        error: (err) => {
          this.loading = false;
          console.error('Error sending OTP', err.error!.error);
          this.toastr.error(err.error?.error, 'Error');
        },
      });
  }

  onSubmit() {
    this.loading = true;
    const userData = {
      email: this.resetPasswordRequestForm.value.email,
      token: this.resetPasswordRequestForm.value.token,
    };
    this.passwordService.verifyResetPasswordToken(userData).subscribe({
      next: () => {
        this.loading = false;
        sessionStorage.setItem(
          'resetEmail',
          this.resetPasswordRequestForm.value.email
        );
        sessionStorage.setItem(
          'resetToken',
          this.resetPasswordRequestForm.value.token
        );
        this.toastr.success('Token verified successfully', 'Success');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Token verification failed', err.error!.error);
        this.toastr.error(err.error!.error, 'Error');
      },
    });
  }
}
