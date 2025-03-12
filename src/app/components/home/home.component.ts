import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import {
  PostLikeDto,
  PostLikesService,
} from '../../services/postLikes/post-likes.service';

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

  constructor(
    private postService: PostService,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private fb: FormBuilder,
    private postLikesService: PostLikesService
  ) {}

  ngOnInit(): void {
    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    this.userName = this.profileService.getUserNameFromToken();
    this.initializeForm();
    this.loadPosts();
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
    this.postService.getAllPosts(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data.items.length === 0 && this.currentPage === 1) {
          this.toastr.info('No posts available.', 'Info');
        }
        this.posts = [...this.posts, ...data.items];
        this.totalPages = data.totalPages;
        this.fetchAllPostLikes();
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
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
      this.postLikesService.getPostLikes(post.id).subscribe({
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
}
