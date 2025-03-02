import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  PostCommentsModel,
  PostDto,
  PostResponseModel,
  PostService,
  UpdatePostDto,
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
import { PostDeletingConfermationComponent } from '../post-deleting-confermation/post-deleting-confermation.component';
import { MatDialog } from '@angular/material/dialog';

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
  comments: PostCommentsModel[] = [];
  userName: string | null = null;
  userRole: any;
  isLoading = false;
  isCommentsLoading = false;
  updateCommentForm!: FormGroup;
  editingCommentId: number | null = null;
  isEditingPost = false;
  updatePostForm!: FormGroup;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  deleteImage = false;
  deleteVideo = false;
  imageFile?: File;
  videoFile?: File;

  postMenuOpen: number | null = null;

  togglePostMenu(postId: number) {
    this.postMenuOpen = this.postMenuOpen === postId ? null : postId;
  }

  toggleCommentMenu(commentId: number) {
    this.activeCommentMenu =
      this.activeCommentMenu === commentId ? null : commentId;
  }

  showPostOptions = false;
  activeCommentMenu: number | null = null;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private commentService: CommentService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userName = this.profileService.getUserNameFromToken();
    this.userRole = this.profileService
      .getCurrentUserRoleFromToken()
      ?.toLowerCase();
    const postId = this.route.snapshot.paramMap.get('postId');
    this.initCommentForm(+postId!);
    if (postId) {
      this.fetchPostDetails(+postId);
    } else {
      this.toastr.error('Invalid Post ID', 'Error');
      this.router.navigate(['/not-found']);
    }
  }

  fetchPostDetails(id: number) {
    this.isLoading = true;
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.post = post;
        this.fetchPostComments(id);
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

  fetchPostComments(postId: number) {
    this.isCommentsLoading = true;
    this.commentService
      .getCommentsByPostId(postId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          const mappedComments = response.items.map((item) => ({
            commentId: item.id,
            userName: item.userName,
            content: item.content,
            createdDate: item.createdDate,
          }));
          this.comments = [...this.comments, ...mappedComments];
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          this.toastr.error(
            'Failed to load comments. Please try again later.',
            'Error'
          );
          console.error('Error fetching comments:', error);
        },
        complete: () => {
          this.isCommentsLoading = false;
        },
      });
  }

  loadMoreComments() {
    if (this.currentPage < this.totalPages && !this.isCommentsLoading) {
      this.currentPage++;
      this.fetchPostComments(this.post.id);
    }
  }

  onDeletePost(id: number) {
    const dialogRef = this.dialog.open(PostDeletingConfermationComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
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
      } else {
        console.log('User canceled post deletion');
      }
    });
  }

  initUpdatePostForm(post: PostResponseModel) {
    this.updatePostForm = this.fb.group({
      content: [
        post.content,
        [
          Validators.required,
          Validators.maxLength(2000),
          Validators.minLength(3),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      deleteImage: [false],
      deleteVideo: [false],
    });
    this.imageFile = undefined;
    this.videoFile = undefined;
    this.isEditingPost = true;
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

  onUpdatePost() {
    if (this.updatePostForm.invalid) {
      this.toastr.error('Please fill out the form correctly.', 'Error');
      return;
    }

    const updatedPost: UpdatePostDto = {
      title: this.updatePostForm.value.title.trim(),
      content: this.updatePostForm.value.content.trim(),
      imageFile: this.imageFile,
      videoFile: this.videoFile,
      deleteImage: this.updatePostForm.value.deleteImage,
      deleteVideo: this.updatePostForm.value.deleteVideo,
    };

    this.postService.updatePost(this.post.id, updatedPost).subscribe({
      next: (response) => {
        this.toastr.success('Post updated successfully!', 'Success');
        console.log('Post Updated: ', response);
        this.post = response;
        this.isEditingPost = false;
        this.deleteImage = false;
        this.deleteVideo = false;
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
        this.comments.unshift({
          userName: response.userName,
          content: response.content,
          createdDate: response.createdDate,
          commentId: response.id,
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
            this.comments[index].content = response.content;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Element;
    if (
      !target.closest('.post-options') &&
      !target.closest('.comment-options')
    ) {
      this.showPostOptions = false;
      this.activeCommentMenu = null;
    }
  }
}
