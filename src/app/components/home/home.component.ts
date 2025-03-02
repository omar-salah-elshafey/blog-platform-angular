import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  posts: PostResponseModel[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  userRole: any;
  postForm!: FormGroup;

  imageFile?: File;
  videoFile?: File;

  constructor(
    private postService: PostService,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
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
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
        this.toastr.error('Error fetching posts.', 'error');
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

    const postDto = {
      title: this.postForm.value.title.trim(),
      content: this.postForm.value.content.trim(),
      imageFile: this.imageFile,
      videoFile: this.videoFile,
    };
    this.postService.addPost(postDto).subscribe({
      next: (response) => {
        this.posts.unshift(response);
        console.log(response.imageUrl);
        console.log(response.videoUrl);
        this.toastr.success('Post created successfully!', 'Success');
        console.log(this.imageFile);
        this.imageFile = undefined;
        this.videoFile = undefined;
        console.log(this.imageFile);
        this.postForm.reset();
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.toastr.error('Error creating post.', 'Error');
      },
    });
  }

  toggleComments(postId: number): void {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.showComments = !post.showComments; // Toggle the visibility
    }
  }
}
