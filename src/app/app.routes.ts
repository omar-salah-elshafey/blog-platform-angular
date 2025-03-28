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
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { adminGuard } from './shared/admin/admin.guard';
import { ManageCommentsComponent } from './components/dashboard/manage-comments/manage-comments.component';
import { ManagePostsComponent } from './components/dashboard/manage-posts/manage-posts.component';
import { ManageUsersComponent } from './components/dashboard/manage-users/manage-users.component';
import { RegisterUserComponent } from './components/dashboard/register-user/register-user.component';
import { MainViewComponent } from './components/dashboard/main-view/main-view.component';

export const routes: Routes = [
  {
    path: 'register',
    component: RegistrationComponent,
    canActivate: [guestGuard],
  },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'reset-password-request', component: ResetPasswordRequestComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'account-settings',
    component: AccountSettingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'search',
    component: SearchUsersComponent,
    canActivate: [authGuard],
  },
  {
    path: 'user-profile/:username',
    component: UserProfileComponent,
    canActivate: [authGuard],
  },
  { path: 'post/:postId', component: PostComponent, canActivate: [authGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: MainViewComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'manage-posts', component: ManagePostsComponent },
      { path: 'manage-comments', component: ManageCommentsComponent },
      { path: 'register-user', component: RegisterUserComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
  { path: 'not-found', component: NotFoundComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
