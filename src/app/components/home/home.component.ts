import { Component, OnInit } from '@angular/core';
import {
  PostResponseModel,
  PostService,
} from '../../services/post/post.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  posts: PostResponseModel[] = [];
  isLoading = false;

  constructor(
    private postService: PostService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
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
  }

  toggleComments(postId: number): void {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.showComments = !post.showComments; // Toggle the visibility
    }
  }
}
