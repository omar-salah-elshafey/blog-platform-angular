import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../services/profile/profile.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private profileServie: ProfileService,
    private sharedService: SharedService
  ) {}

  isMenuOpen = false;
  firstName: string | null = null;
  userRole: any;

  ngOnInit(): void {
    this.userRole = this.profileServie
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    if (this.isLoggedIn()) {
      this.sharedService.userProfile$.subscribe((profile) => {
        if (profile) {
          this.firstName = profile.firstName;
        }
      });
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        this.toastr.success('Logout successful!', 'Success');
        console.log('Logout successful', response!);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toastr.error(error.error!.error, 'error');
        console.error('Logout failed:', error.error);
      },
    });
    this.sharedService.clearUserProfile();
  }
}
