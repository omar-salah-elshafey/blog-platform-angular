import { Component, HostListener } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { PostDeletingConfermationComponent } from '../post-deleting-confermation/post-deleting-confermation.component';

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
  showPostOptions = false;
  postMenuOpen: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    private postService: PostService,
    private postLikesService: PostLikesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    this.userName = this.route.snapshot.paramMap.get('username');
    if (this.userName) {
      this.posts = [];
      this.getUserProfile(this.userName);
      this.fetchUserFeed(this.userName);
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
      this.fetchUserFeed(userName);
    }
  }

  fetchUserFeed(userName: string): void {
    this.isPostsLoading = true;
    this.postService
      .getUserFeed(userName, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.isPostsLoading = false;
          this.posts = [...this.posts, ...data.items];
          this.totalPages = data.totalPages;
          this.fetchAllPostLikes();
        },
        error: (error) => {
          this.toastr.error(
            'Failed to fetch feed. Please try again later.',
            'Error'
          );
          this.isPostsLoading = false;
        },
      });
  }

  fetchAllPostLikes() {
    this.posts.forEach((post) => {
      const postId = post.sharedPostId ? post.originalPost!.id : post.id;
      this.postLikesService.getPostLikes(postId).subscribe({
        next: (likes) => {
          this.postLikesMap[post.id] = likes;
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

  sharePost(postId: number) {
    this.postService.sharePost(postId).subscribe({
      next: () => {
        this.toastr.success('Post shared successfully', 'Success');
      },
      error: (error) => {
        this.toastr.error(error.error?.error || 'Error sharing post', 'Error');
      },
    });
  }

  togglePostMenu(postId: number) {
    this.postMenuOpen = this.postMenuOpen === postId ? null : postId;
  }

  onDeletePost(id: number) {
    const dialogRef = this.dialog.open(PostDeletingConfermationComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.postService.deleteSharedPost(id).subscribe({
          next: () => {
            this.toastr.success('Post deleted successfully!', 'Success');
            this.posts = this.posts.filter((post) => post.id !== id);
          },
          error: (error) => {
            console.error('Error deleting the Post:', error);
            this.toastr.error(error.error!.error, 'Error');
          },
        });
      } else {
        console.log('User canceled post deletion');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;

    if (!targetElement.closest('.post-options')) {
      this.postMenuOpen = null;
    }
  }
}
