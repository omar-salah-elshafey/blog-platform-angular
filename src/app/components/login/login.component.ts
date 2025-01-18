import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      EmailOrUserName: ['', [Validators.required]],
      Password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          ),
        ],
      ],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    const trimmedFormValue = {
      EmailOrUserName: this.loginForm.value.EmailOrUserName.trim(),
      Password: this.loginForm.value.Password.trim(),
    };
    if (this.loginForm.valid) {
      this.authService.login(trimmedFormValue).subscribe({
        next: (response) => {
          console.log('login successful:', response);
          this.toastr.success('Login successful!', 'Success');
          this.loginForm.reset();
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.toastr.error(
            error.error?.error || 'An unexpected error occurred.',
            'Error'
          );
          console.error('Login failed:', error.error);
        },
      });
      console.log('Form Submitted', trimmedFormValue);
    } else {
      this.toastr.warning('Please fill in all required fields.', 'Warning');
      console.error('Form Invalid');
    }
  }
}
