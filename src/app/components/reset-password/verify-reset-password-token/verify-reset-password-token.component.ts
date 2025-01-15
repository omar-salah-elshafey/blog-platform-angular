import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PasswordService } from '../../../services/password/password.service';

@Component({
  selector: 'app-reset-password-token-verification',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './verify-reset-password-token.component.html',
  styleUrl: './verify-reset-password-token.component.scss',
})
export class VerifyResetPasswordTokenComponent {
  verifyResetPasswordTokenForm!: FormGroup;
  tokenSent: boolean = false;
  tokenVerified: boolean = false;

  constructor(
    private passwordService: PasswordService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.verifyResetPasswordTokenForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
    });
  }

  onSubmit() {
    const userData = {
      email: this.verifyResetPasswordTokenForm.value.email,
      token: this.verifyResetPasswordTokenForm.value.token,
    };
    this.passwordService.verifyResetPasswordToken(userData).subscribe({
      next: () => {
        sessionStorage.setItem(
          'resetEmail',
          this.verifyResetPasswordTokenForm.value.email
        );
        sessionStorage.setItem(
          'resetToken',
          this.verifyResetPasswordTokenForm.value.token
        );
        this.toastr.success('Token verified successfully', 'Success');
        console.log('Token verified successfully');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        console.error('Token verification failed', err.error!.error);
        this.toastr.error(err.error!.error, 'Error');
      },
    });
  }

  onResendToken() {
    this.passwordService
      .resetPasswordRequest(this.verifyResetPasswordTokenForm.value.email)
      .subscribe({
        next: (response) => {
          this.tokenSent = true;
          this.toastr.success('Token sent to your email', 'Success');
          console.log('Token sent to your email');
        },
        error: (err) => {
          console.error('Error sending token', err.error!.error);
          this.toastr.error(err.error?.error, 'Error');
        },
      });
  }
}
