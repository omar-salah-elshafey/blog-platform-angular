import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  PostResponseModel,
  PostService,
} from '../../../services/post/post.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PostDeletingConfermationComponent } from '../../post-deleting-confermation/post-deleting-confermation.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-posts',
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-posts.component.html',
  styleUrl: './manage-posts.component.scss',
})
export class ManagePostsComponent implements OnInit {
  posts: PostResponseModel[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private toastr: ToastrService,
    private postService: PostService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllPosts();
  }

  getAllPosts() {
    this.loading = true;
    this.postService.getAllPosts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.items];
        this.loading = false;
        this.totalPages = response.totalPages;
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

  loadMorePosts() {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.getAllPosts();
    }
  }

  onDeleteAccount(id: number) {
    const dialogRef = this.dialog.open(PostDeletingConfermationComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.postService.deletePost(id).subscribe({
          next: (response) => {
            this.toastr.success('Post deleted successfully!', 'Success');
            this.posts = this.posts.filter((post) => post.id !== id);
            console.log('Psot Delted: ', response);
          },
          error: (error) => {
            console.error('Error deleting the Post:', error);
            this.toastr.error(
              'Failed to delete the Post. Please try again later.',
              'Error'
            );
          },
        });
      } else {
        console.log('User canceled post deletion');
      }
    });
  }
}
