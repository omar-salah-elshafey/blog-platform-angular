import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../services/profile/profile.service';
import { SharedService } from '../../services/shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  NotificationService,
  Notification,
} from '../../services/notification/notification.service';
import { Subscription } from 'rxjs';

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
    private profileService: ProfileService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {}

  isMenuOpen = false;
  firstName: string | null = null;
  lastName: string | null = null;
  isAdmin = false;
  currentLang = 'en';
  isDropdownOpen = false;
  isNotificationsOpen = false;
  notifications: Notification[] = [];
  notificationCount = 0;

  private notificationSubscription: Subscription | null = null;
  private profileSubscription: Subscription | null = null;
  private langSubscription: Subscription | null = null;

  @ViewChild('mobileNav') mobileNav!: ElementRef;
  @ViewChild('mobileMenuButton')
  mobileMenuButton!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('notificationList') notificationList!: ElementRef;

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.currentLang);
    this.langSubscription = this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      localStorage.setItem('language', this.currentLang);
    });

    this.loadUserInfo();

    this.notificationService.loadNotifications();

    this.sharedService.userProfile$.subscribe((profile) => {
      if (profile) {
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        this.isAdmin =
          profile.role === 'Admin' || profile.role === 'SuperAdmin';
      }
    });

    this.notificationSubscription =
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
        this.notificationCount = notifications.length;
      });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  loadUserInfo() {
    if (this.authService.isLoggedIn()) {
      const userProfile = this.sharedService.getUserProfile();
      if (userProfile) {
        this.firstName = userProfile.firstName;
        this.isAdmin = userProfile.role === 'Admin';
      } else {
        this.profileService.getCurrentUserProfile().subscribe({
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
        this.sharedService.clearUserProfile();
        this.router.navigate(['/login']);
      },
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      setTimeout(() => {
        this.notificationService.loadNotifications();
      }, 100);
    }
  }

  navigateToPost(postId: number, notificationId: number) {
    this.router.navigate(['/post', postId]);
    this.isNotificationsOpen = false;
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        this.notificationService.removeNotification(notificationId);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      },
    });
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

    if (
      this.isNotificationsOpen &&
      this.notificationList &&
      !this.notificationList.nativeElement.contains(event.target) &&
      !(event.target as HTMLElement).closest('.notification-icon')
    ) {
      this.isNotificationsOpen = false;
    }
  }

  profileSettings() {
    this.router.navigate(['/account-settings']);
  }
}
