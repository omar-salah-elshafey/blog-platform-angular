import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin/admin.service';
import {
  PostResponseModel,
  PostService,
} from '../../../services/post/post.service';
import { CommentResponseModel } from '../../../services/comment/comment.service';
import { ToastrService } from 'ngx-toastr';
import {
  ProfileService,
  UserProfile,
} from '../../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-view',
  imports: [CommonModule, RouterModule],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss',
})
export class MainViewComponent {
  userName: string | null = null;
  loading = false;
  users: UserProfile[] = [];
  posts: PostResponseModel[] = [];
  comments: CommentResponseModel[] = [];
  postsCount = 0;
  commentsCount = 0;
  usersCount = 0;
  constructor(
    private adminService: AdminService,
    private postService: PostService,
    private toastr: ToastrService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.userName = this.profileService.getUserNameFromToken();
    this.getUsersCount();
    this.getPostsCount();
    this.getCommentsCount();
    this.getAllUsers();
    this.getAllPosts();
    this.getAllComments();
  }

  getUsersCount() {
    this.adminService.getUsersCount().subscribe({
      next: (value) => {
        this.usersCount = value;
        console.log('Users Count: ' + value);
      },
      error: (error) => {
        this.toastr.error(
          'Error fetching results, please try again later.',
          'Error'
        );
        console.error('Error:', error);
      },
    });
  }

  getPostsCount() {
    this.adminService.getPostsCount().subscribe({
      next: (value) => {
        this.postsCount = value;
        console.log('Posts Count: ' + value);
      },
      error: (error) => {
        this.toastr.error(
          'Error fetching results, please try again later.',
          'Error'
        );
        console.error('Error:', error);
      },
    });
  }

  getCommentsCount() {
    this.adminService.getCommentsCount().subscribe({
      next: (value) => {
        this.commentsCount = value;
        console.log('Comments Count: ' + value);
      },
    });
  }

  getAllUsers() {
    this.loading = true;
    this.adminService.getAllUsers(1, 5).subscribe({
      next: (response) => {
        this.users = response.items;
        this.loading = false;
        console.log(response.items);
      },
      error: (error) => {
        this.toastr.error(
          'Error fetching results, please try again later.',
          'Error'
        );
        console.error('Error:', error);
        this.loading = false;
      },
    });
  }

  getAllPosts() {
    this.loading = true;
    this.postService.getAllPosts(1, 5).subscribe({
      next: (response) => {
        this.posts = response.items;
        this.loading = false;
        console.log(response.items);
      },
      error: (error) => {
        this.toastr.error(
          'Error fetching results, please try again later.',
          'Error'
        );
        console.error('Error:', error);
        this.loading = false;
      },
    });
  }

  getAllComments() {
    this.loading = true;
    this.adminService.getAllComments(1, 5).subscribe({
      next: (response) => {
        this.comments = response.items;
        this.loading = false;
        console.log(response.items);
      },
      error: (error) => {
        this.toastr.error(
          'Error fetching results, please try again later.',
          'Error'
        );
        console.error('Error:', error);
        this.loading = false;
      },
    });
  }
}
