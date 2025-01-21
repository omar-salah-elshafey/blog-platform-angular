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
  userRole: any;
  postForm!: FormGroup;

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
    this.isLoading = true;
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        console.log(this.posts);
        this.toastr.success('Getting all the posts.', 'success');
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
        this.toastr.error('Error fetching posts.', 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(3),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
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
    };
    this.postService.addPost(postDto).subscribe({
      next: (response) => {
        this.posts.unshift(response);
        this.toastr.success('Post created successfully!', 'Success');
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
