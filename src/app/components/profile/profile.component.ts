import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  UserProfile,
  ProfileService,
} from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import {
  PostResponseModel,
  PostService,
} from '../../services/post/post.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  isProfileLoading = false;
  isPostsLoading = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  posts: PostResponseModel[] = [];

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.sharedService.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userProfile = { ...this.userProfile, ...profile };
        this.fetchUserPosts(profile.userName);
      }
    });

    const cachedProfile = this.sharedService.getUserProfile();
    if (!cachedProfile) {
      this.fetchUserProfile();
    } else {
      this.userProfile = cachedProfile;

      this.fetchUserPosts(cachedProfile.userName);
    }
  }

  fetchUserProfile(): void {
    this.isProfileLoading = true;
    this.profileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.sharedService.setUserProfile(profile);
      },
      error: (error) => {
        this.toastr.error(
          'Failed to fetch user profile. Please try again later.',
          'Error'
        );
        console.error('Error fetching user profile:', error);
      },
      complete: () => {
        this.isProfileLoading = false;
      },
    });
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
  loadMorePosts(): void {
    var userName = this.userProfile!.userName;
    if (this.currentPage < this.totalPages && !this.isPostsLoading) {
      this.currentPage++;
      this.fetchUserPosts(userName);
    }
  }

  profileSettings() {
    this.router.navigate(['/account-settings']);
  }
}
