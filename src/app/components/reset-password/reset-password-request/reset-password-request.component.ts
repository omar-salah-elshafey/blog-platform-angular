import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PasswordService } from '../../../services/password/password.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
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

  constructor(
    private passwordService: PasswordService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.resetPasswordRequestForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
    });
  }

  onSendToken() {
    this.passwordService
      .resetPasswordRequest(this.resetPasswordRequestForm.value.email)
      .subscribe({
        next: (response) => {
          this.tokenSent = true;
          this.toastr.success('Token sent to your email', 'Success');
        },
        error: (err) => {
          console.error('Error sending token', err.error!.error);
          this.toastr.error(err.error?.error, 'Error');
        },
      });
  }

  onSubmit() {
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
        this.toastr.success('Token verified successfully', 'Success');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        console.error('Token verification failed', err.error!.error);
        this.toastr.error(err.error!.error, 'Error');
      },
    });
  }
}
