import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

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
    private cookieService: CookieService
  ) {}

  isMenuOpen = false;

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  logout() {
    this.authService.logout().subscribe(
      (response) => {
        console.log('Logout successful', response!);
        this.cookieService.delete('refreshToken');
        this.cookieService.delete('accessToken');
        this.toastr.success('Logout successful!', 'Success');
        this.router.navigate(['/login']);
      },
      (error) => {
        this.toastr.error(
          error.error?.error
        );
        console.error('Logout failed:', error.error);
      }
    );
  }
}
