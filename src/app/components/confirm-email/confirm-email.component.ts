import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { EmailService } from '../../services/email/email.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent {
  confirmEmailForm!: FormGroup;
  showResendForm: boolean = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private emailService: EmailService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.confirmEmailForm = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
      Token: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.confirmEmailForm.valid) {
      this.isLoading = true;
      this.emailService.confirmEmail(this.confirmEmailForm.value).subscribe({
        next: (response) => {
          this.toastr.success(
            'Your email has been confirmed successfully.',
            'Success'
          );
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error(
            'Email confirmation failed:',
            error.error!.error,
            error.status
          );
          if (
            error.status === 400 
          ) {
            this.showResendForm = true;
            this.toastr.warning(error.error!.error, 'Invalid Token');
          } else {
            this.toastr.error(error.error!.error, 'Error');
          }
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.toastr.warning('Please fill in all fields correctly.', 'Warning');
    }
  }

  onResendRequest(): void {
    const emailControl = this.confirmEmailForm.get('Email');
    if (emailControl?.valid) {
      this.isLoading = true;
      this.emailService.resendConfirmationEmail(emailControl!.value).subscribe({
        next: (response) => {
          this.toastr.success(
            'A new confirmation email has been sent to your email.',
            'Success'
          );
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error(error.error!.error, 'Error');
          console.error('Resend email failed:', error.error!.error);
          this.isLoading = false;
        },
      });
    } else {
      this.toastr.warning('Please provide a valid email.', 'Warning');
    }
  }
}
