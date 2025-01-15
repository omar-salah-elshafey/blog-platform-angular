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

@Component({
  selector: 'app-reset-password-request',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password-request.component.html',
  styleUrl: './reset-password-request.component.scss',
})
export class ResetPasswordRequestComponent {
  resetPasswordRequestForm!: FormGroup;
  tokenSent: boolean = false;

  constructor(
    private passwordService: PasswordService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.resetPasswordRequestForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.passwordService
      .resetPasswordRequest(this.resetPasswordRequestForm.value.email)
      .subscribe({
        next: (response) => {
          this.tokenSent = true;
          this.toastr.success('Token sent to your email', 'Success');
          console.log('Token sent to your email');
          //navigate to verify-reset-password-token
          this.router.navigate(['/varify-reset-password-token']);
        },
        error: (err) => {
          console.error('Error sending token', err.error!.error);
          this.toastr.error(err.error?.error, 'Error');
        },
      });
  }

  onVerifyToken() {
    const userData = {
      email: this.resetPasswordRequestForm.value.email,
      token: this.resetPasswordRequestForm.value.token,
    };
    this.passwordService.verifyResetPasswordToken(userData).subscribe({
      next: () => {
        sessionStorage.setItem(
          'resetEmail',
          this.resetPasswordRequestForm.value.email
        );
        sessionStorage.setItem(
          'resetToken',
          this.resetPasswordRequestForm.value.token
        );
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        console.error('Token verification failed', err);
      },
    });
  }

  onResendToken() {
    this.onSubmit();
  }
}
