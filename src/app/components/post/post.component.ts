import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  PostCommentsModel,
  PostDto,
  PostResponseModel,
  PostService,
} from '../../services/post/post.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  CommentDto,
  CommentService,
} from '../../services/comment/comment.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'app-post',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
  post!: PostResponseModel;
  commentForm!: FormGroup;
  isSubmitting = false;
  comments: Array<PostCommentsModel> = [];
  userName: string | null = null;
  userRole: any;
  isLoading = false;
  updateCommentForm!: FormGroup;
  editingCommentId: number | null = null;
  isEditingPost = false;
  updatePostForm!: FormGroup;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private commentService: CommentService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.userName = this.profileService.getUserNameFromToken();
    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    this.route.queryParamMap.subscribe((params) => {
      const postId = params.get('postId');
      this.initCommentForm(+postId!);
      if (postId) {
        this.fetchPostDetails(+postId);
      } else {
        this.toastr.error('Invalid Post ID', 'Error');
        this.router.navigate(['/']);
      }
    });
  }

  fetchPostDetails(id: number) {
    this.isLoading = true;
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.post = post;
        this.comments = post.comments;
        console.log('Fetched user post:', post);
      },
      error: (error) => {
        this.toastr.error(
          'Failed to fetch post. Please try again later.',
          'Error'
        );
        this.router.navigate(['/not-found']);
        console.error('Error fetching user post:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onDeletePost(id: number) {
    this.postService.deletePost(id).subscribe({
      next: (response) => {
        this.toastr.success('Post deleted successfully!', 'Success');
        console.log('Psot Delted: ', response);
        if (this.userRole === 'admin') this.router.navigate(['/home']);
        else this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Error deleting the Post:', error);
        this.toastr.error(
          'Failed to delete the Post. Please try again later.',
          'Error'
        );
      },
    });
  }

  initUpdatePostForm(post: PostResponseModel) {
    // validate the comment form so it can't be white sapces
    this.updatePostForm = this.fb.group({
      title: [
        post.title,
        [
          Validators.required,
          Validators.maxLength(200),
          Validators.minLength(1),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      content: [
        post.content,
        [
          Validators.required,
          Validators.maxLength(2000),
          Validators.minLength(1),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
    });
    this.isEditingPost = true;
  }

  onUpdatePost() {
    if (this.updatePostForm.invalid) {
      this.toastr.error('Please fill out the form correctly.', 'Error');
      return;
    }

    const updatedPost: PostDto = this.updatePostForm.value;

    this.postService.updatePost(this.post.id, updatedPost).subscribe({
      next: (response) => {
        this.toastr.success('Post updated successfully!', 'Success');
        console.log('Post Updated: ', response);
        this.post.title = this.updatePostForm.value.title.trim();
        this.post.content = this.updatePostForm.value.content.trim();
        this.isEditingPost = false;
      },
      error: (error) => {
        console.error('Error updating the post:', error);
        this.toastr.error(
          'Failed to update the post. Please try again.',
          'Error'
        );
      },
    });
  }

  initCommentForm(postId: number) {
    this.commentForm = this.fb.group({
      content: [
        { value: '', disabled: this.isSubmitting },
        [
          Validators.required,
          Validators.maxLength(1000),
          Validators.minLength(1),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      postId: [postId, Validators.required],
    });
  }

  onAddComment() {
    if (this.commentForm.invalid) {
      this.toastr.error('Please enter a valid comment.', 'Error');
      return;
    }
    this.isSubmitting = true;
    const commentDto: CommentDto = {
      PostId: this.post.id,
      Content: this.commentForm.value.content.trim(),
    };
    this.commentService.addComment(commentDto).subscribe({
      next: (response) => {
        this.toastr.success('Comment added successfully!', 'Success');
        this.comments.push({
          userName: this.userName!,
          content: this.commentForm.value.content.trim(),
          createdDate: new Date().toISOString(),
          commentId: response.Id,
        });
        this.changeDetectorRef.detectChanges();
        this.commentForm.reset({ content: '', postId: this.post.id });
        console.log('comment added: ', response);
      },
      error: (error) => {
        this.toastr.error('Failed to add comment. Please try again.', 'Error');
        console.error('Error adding comment:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  onDeleteComment(id: number): void {
    this.commentService.deleteComment(id).subscribe({
      next: (response) => {
        this.toastr.success('Comment deleted successfully!', 'Success');
        this.comments = this.comments.filter(
          (comment) => comment.commentId !== id
        );
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

  initUpdateCommentForm(comment: PostCommentsModel) {
    this.updateCommentForm = this.fb.group({
      content: [
        { value: comment.content, disabled: this.isSubmitting },
        [
          Validators.required,
          Validators.maxLength(1000),
          Validators.minLength(1),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      postId: [this.post.id, Validators.required],
    });
    this.editingCommentId = comment.commentId;
  }

  onUpdateComment(comment: PostCommentsModel) {
    if (this.updateCommentForm.invalid) {
      this.toastr.error('Please enter a valid comment.', 'Error');
      return;
    }
    const updatedComment: CommentDto = {
      PostId: this.post.id,
      Content: this.updateCommentForm.value.content.trim(),
    };
    this.commentService
      .updateComment(comment.commentId, updatedComment)
      .subscribe({
        next: (response) => {
          this.toastr.success('Comment updated successfully!', 'Success');
          const index = this.comments.findIndex(
            (c) => c.commentId === comment.commentId
          );
          if (index !== -1) {
            this.comments[index].content =
              this.updateCommentForm.value.content.trim();
          }
          this.editingCommentId = null;
        },
        error: (error) => {
          console.error('Error updating comment:', error);
          this.toastr.error(
            'Failed to update comment. Please try again.',
            'Error'
          );
        },
      });
  }
}
