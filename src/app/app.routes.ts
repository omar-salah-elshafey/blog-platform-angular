import { Routes } from '@angular/router';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password/reset-password.component';
import { ResetPasswordRequestComponent } from './components/reset-password/reset-password-request/reset-password-request.component';

export const routes: Routes = [
  { path: 'register', component: RegistrationComponent },
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'reset-password-request', component: ResetPasswordRequestComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
