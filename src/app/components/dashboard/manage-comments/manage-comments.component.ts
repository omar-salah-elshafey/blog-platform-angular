import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CommentResponseModel,
  CommentService,
} from '../../../services/comment/comment.service';
import { AdminService } from '../../../services/admin/admin.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-comments',
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './manage-comments.component.html',
  styleUrl: './manage-comments.component.scss',
})
export class ManageCommentsComponent implements OnInit {
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  comments: CommentResponseModel[] = [];
  constructor(
    private adminService: AdminService,
    private commentService: CommentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllComments();
  }

  getAllComments() {
    this.loading = true;
    this.adminService
      .getAllComments(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.comments = [...this.comments, ...response.items];
          this.totalPages = response.totalPages;
          this.loading = false;
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

  loadMoreComments() {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.getAllComments();
    }
  }

  onDeleteComment(id: number): void {
    this.commentService.deleteComment(id).subscribe({
      next: (response) => {
        this.toastr.success('Comment deleted successfully!', 'Success');
        this.comments = this.comments.filter((comment) => comment.id !== id);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.toastr.error(
          'Failed to delete comment. Please try again later.',
          'Error'
        );
      },
    });
  }
}
