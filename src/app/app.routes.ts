import { Routes } from '@angular/router';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password/reset-password.component';
import { ResetPasswordRequestComponent } from './components/reset-password/reset-password-request/reset-password-request.component';
import { ProfileComponent } from './components/profile/profile.component';
import { guestGuard } from './shared/guest/guest.guard';
import { authGuard } from './shared/auth/auth.guard';
import { SearchUsersComponent } from './components/search-users/search-users.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import { PostComponent } from './components/post/post.component';

export const routes: Routes = [
  {
    path: 'register',
    component: RegistrationComponent,
    canActivate: [guestGuard],
  },
  { path: '', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'reset-password-request', component: ResetPasswordRequestComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'search',
    component: SearchUsersComponent,
    canActivate: [authGuard],
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    canActivate: [authGuard],
  },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'post', component: PostComponent, canActivate: [authGuard] },
  { path: 'not-found', component: NotFoundComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
