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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  userProfile!: UserProfile;
  posts: PostResponseModel[] = [];
  isProfileLoading = false;
  isPostsLoading = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    private postService: PostService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.posts = [];
      this.getUserProfile(username);
      this.fetchUserPosts(username);
    }
  }

  getUserProfile(username: string) {
    this.isProfileLoading = true;
    this.profileService.getUserProfile(username).subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (error) => {
        this.toastr.error('Error loading user profile.', 'Error');
        console.error(error);
        this.router.navigate(['/not-found']);
      },
      complete: () => {
        this.isProfileLoading = false;
      },
    });
  }

  loadMorePosts(): void {
    var userName = this.userProfile.userName;
    if (this.currentPage < this.totalPages && !this.isPostsLoading) {
      this.currentPage++;
      this.fetchUserPosts(userName);
    }
  }

  fetchUserPosts(userName: string): void {
    this.isPostsLoading = true;
    this.postService
      .getPostsByUser(userName, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.posts = [...this.posts, ...data.items];
          this.totalPages = data.totalPages;
        },
        error: (error) => {
          this.toastr.error(
            'Failed to fetch posts. Please try again later.',
            'Error'
          );
          console.error('Error fetching user posts:', error);
        },
        complete: () => {
          this.isPostsLoading = false;
        },
      });
  }
}
