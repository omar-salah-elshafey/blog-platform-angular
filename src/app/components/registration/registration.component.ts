import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(3)]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
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

  onSubmit(): void {
    const trimmedFormValue = {
      firstName: this.registrationForm.value.firstName.trim(),
      lastName: this.registrationForm.value.lastName.trim(),
      username: this.registrationForm.value.username.trim(),
      email: this.registrationForm.value.email.trim(),
      password: this.registrationForm.value.password.trim(),
      confirmPassword: this.registrationForm.value.confirmPassword.trim(),
    };
    if (this.registrationForm.valid) {
      this.authService.registerReader(trimmedFormValue).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.toastr.success('Login successful!', 'Success');
          this.router.navigate(['/confirm-email']);
        },
        error: (error) => {
          this.toastr.error(error.error, 'Error');
          console.error('Registration failed:', error.error);
        },
      });
      console.log('Form Submitted', trimmedFormValue);
    } else {
      this.toastr.warning('Please fill in all required fields.', 'Warning');
      console.error('Form Invalid');
    }
  }
}
