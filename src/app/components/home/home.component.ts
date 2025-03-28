import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  PostResponseModel,
  PostService,
} from '../../services/post/post.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile/profile.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PostLikeDto,
  PostLikesService,
} from '../../services/postLikes/post-likes.service';
import { MatDialog } from '@angular/material/dialog';
import { PostDeletingConfermationComponent } from '../post-deleting-confermation/post-deleting-confermation.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  posts: PostResponseModel[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  userRole: any;
  postForm!: FormGroup;
  posting = false;

  imageFile?: File;
  videoFile?: File;

  userName: string | null = null;
  likes: PostLikeDto[] = [];
  postLikesMap: { [postId: number]: PostLikeDto[] } = {};
  showPostOptions = false;
  postMenuOpen: number | null = null;

  currentLang = 'en';
  private langSubscription: Subscription | null = null;

  constructor(
    private postService: PostService,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private postLikesService: PostLikesService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.currentLang);
    this.langSubscription = this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      localStorage.setItem('language', this.currentLang);
    });

    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    this.userName = this.profileService.getUserNameFromToken();
    this.initializeForm();
    this.loadPosts();
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  loadMorePosts(): void {
    if (this.isLoading || this.currentPage >= this.totalPages) {
      return;
    }
    this.currentPage++;
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.postService.getHomeFeed(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data.items.length === 0 && this.currentPage === 1) {
          this.toastr.info('No posts available.', 'Info');
        }
        this.posts = [...this.posts, ...data.items];
        this.totalPages = data.totalPages;
        this.fetchAllPostLikes();
      },
      error: (err) => {
        this.toastr.error('Error fetching posts.', 'error');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  onFileSelected(event: Event, fileType: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (fileType === 'image') {
        this.imageFile = input.files[0];
      } else if (fileType === 'video') {
        this.videoFile = input.files[0];
      }
    }
  }
  removeFile(type: 'image' | 'video') {
    if (type === 'image') {
      this.imageFile = undefined;
    } else {
      this.videoFile = undefined;
    }
  }
  initializeForm(): void {
    this.postForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.maxLength(5000),
          Validators.minLength(3),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
    });
  }

  onCreatePost(): void {
    if (this.postForm.invalid) {
      return;
    }
    this.posting = true;
    this.postForm.disable();
    const postDto = {
      content: this.postForm.value.content.trim(),
      imageFile: this.imageFile,
      videoFile: this.videoFile,
    };
    this.postService.addPost(postDto).subscribe({
      next: (response) => {
        this.posts.unshift(response);
        this.toastr.success('Post created successfully!', 'Success');
        this.imageFile = undefined;
        this.videoFile = undefined;
        this.postForm.reset();
        this.posting = false;
        this.postForm.enable();
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.toastr.error('Error creating post.', 'Error');
        this.posting = false;
        this.postForm.enable();
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
        this.toastr.error(
          error.error!.error || 'Failed to toggle like',
          'Error'
        );
      },
    });
  }

  sharePost(postId: number) {
    this.postService.sharePost(postId).subscribe({
      next: (sharedPost) => {
        this.toastr.success('Post shared successfully', 'Success');
        this.posts.unshift(sharedPost);
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
