import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  ProfileService,
  UserProfile,
} from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import {
  PostResponseModel,
  PostService,
} from '../../services/post/post.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  userProfile!: UserProfile;
  loading: boolean = false;
  posts: PostResponseModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    private postService: PostService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const username = params.get('username');
      if (username) {
        this.getUserProfile(username);
        this.fetchUserPosts(username);
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
  fetchUserPosts(userName: string): void {
    this.posts = [];
    this.postService.getPostsByUser(userName).subscribe({
      next: (posts) => {
        this.posts = posts;
        console.log('Fetched user posts:', posts);
      },
      error: (error) => {
        this.toastr.error(
          'Failed to fetch posts. Please try again later.',
          'Error'
        );
        console.error('Error fetching user posts:', error);
      },
    });
  }
}
