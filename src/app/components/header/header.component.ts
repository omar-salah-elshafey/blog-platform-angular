import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../services/profile/profile.service';
import { SharedService } from '../../services/shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private profileServie: ProfileService,
    private sharedService: SharedService,
    private translate: TranslateService
  ) {}

  isMenuOpen = false;
  firstName: string | null = null;
  isAdmin = false;
  currentLang = 'en';
  isDropdownOpen = false;

  @ViewChild('mobileNav') mobileNav!: ElementRef;
  @ViewChild('mobileMenuButton')
  mobileMenuButton!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.loadUserInfo();

    this.sharedService.userProfile$.subscribe((profile) => {
      if (profile) {
        this.firstName = profile.firstName;
        this.isAdmin = profile.role === 'Admin';
      }
    });
  }

  loadUserInfo() {
    if (this.authService.isLoggedIn()) {
      const userProfile = this.sharedService.getUserProfile();
      if (userProfile) {
        this.firstName = userProfile.firstName;
        this.isAdmin = userProfile.role === 'Admin';
      } else {
        this.profileServie.getCurrentUserProfile().subscribe({
          next: (profile) => {
            this.firstName = profile.firstName;
            this.isAdmin = profile.role === 'Admin';
            this.sharedService.setUserProfile(profile);
          },
          error: () => {
            this.firstName = null;
            this.isAdmin = false;
          },
        });
      }
    } else {
      this.firstName = null;
      this.isAdmin = false;
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
        this.sharedService.clearUserProfile();
        this.firstName = null;
        this.isAdmin = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toastr.error(error.error!.error, 'error');
        console.error('Logout failed:', error.error);
      },
    });
    this.sharedService.clearUserProfile();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.isMenuOpen &&
      this.mobileNav &&
      this.mobileMenuButton &&
      !this.mobileNav.nativeElement.contains(event.target) &&
      !this.mobileMenuButton.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }

    if (
      this.isDropdownOpen &&
      this.dropdown &&
      !this.dropdown.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen = false;
    }
  }
}
