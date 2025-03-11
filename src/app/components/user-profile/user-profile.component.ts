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
import {
  PostLikeDto,
  PostLikesService,
} from '../../services/postLikes/post-likes.service';

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
  pageSize = 10;
  totalPages = 1;
  userRole: any;

  userName: string | null = null;
  likes: PostLikeDto[] = [];
  postLikesMap: { [postId: number]: PostLikeDto[] } = {};

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    private postService: PostService,
    private postLikesService: PostLikesService
  ) {}

  ngOnInit() {
    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    this.userName = this.route.snapshot.paramMap.get('username');
    if (this.userName) {
      this.posts = [];
      this.getUserProfile(this.userName);
      this.fetchUserPosts(this.userName);
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
          this.fetchAllPostLikes();
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
