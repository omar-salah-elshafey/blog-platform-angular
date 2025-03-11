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
import { AuthService } from '../../services/auth/auth-service.service';
import {
  PostLikeDto,
  PostLikesService,
} from '../../services/postLikes/post-likes.service';

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
  pageSize = 4;
  totalPages = 1;
  posts: PostResponseModel[] = [];

  userName: string | null = null;
  likes: PostLikeDto[] = [];
  postLikesMap: { [postId: number]: PostLikeDto[] } = {};

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private postLikesService: PostLikesService
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
    this.userName = this.profileService.getUserNameFromToken();
    this.fetchUserPosts(this.userName!);
  }

  fetchUserProfile(): void {
    this.isProfileLoading = true;
    this.profileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.isProfileLoading = false;
        this.userProfile = profile;
        this.sharedService.setUserProfile(profile);
      },
      error: () => {
        this.toastr.error(
          'Failed to fetch user profile. Please try again later.',
          'Error'
        );
        this.isProfileLoading = false;
        this.authService.logout().subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (logoutError) => {
            this.router.navigate(['/login']);
          },
        });
      },
    });
  }

  fetchUserPosts(userName: string): void {
    this.isPostsLoading = true;
    this.postService
      .getPostsByUser(userName, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.isPostsLoading = false;
          this.posts = [...this.posts, ...data.items];
          this.totalPages = data.totalPages;
          this.fetchAllPostLikes();
        },
        error: (error) => {
          this.toastr.error(
            'Failed to fetch posts. Please try again later.',
            'Error'
          );
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

  fetchAllPostLikes() {
    this.posts.forEach((post) => {
      this.postLikesService.getPostLikes(post.id).subscribe({
        next: (likes) => {
          this.postLikesMap[post.id] = likes;
          console.log(`Likes for post ${post.id}:`, likes);
        },
        error: (error) => {
          console.error(`Error fetching likes for post ${post.id}:`, error);
        },
      });
    });
  }

  isLikedByCurrentUser(postId: number): boolean {
    const likes = this.postLikesMap[postId] || [];
    return this.userName
      ? likes.some((like) => like.userName === this.userName)
      : false;
  }

  toggleLike(postId: number) {
    this.postLikesService.toggleLike(postId).subscribe({
      next: (updatedLikes) => {
        this.postLikesMap[postId] = updatedLikes;
      },
      error: (error) => {
        console.error(`Error toggling like for post ${postId}:`, error);
      },
    });
  }
}
