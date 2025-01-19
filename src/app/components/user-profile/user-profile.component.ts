import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  ProfileService,
  UserProfile,
} from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  userProfile!: UserProfile;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const username = params.get('username');
      if (username) {
        this.getUserProfile(username);
      }
    });
  }

  getUserProfile(username: string) {
    this.loading = true;
    this.profileService.getUserProfile(username).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.toastr.success('User profile loaded successfully.', 'Success');
      },
      error: (error) => {
        this.toastr.error('Error loading user profile.', 'Error');
        console.error(error);
        this.router.navigate(['/not-found']);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
