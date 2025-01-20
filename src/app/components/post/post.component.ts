import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  PostCommentsModel,
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

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private commentService: CommentService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    });
  }

  initCommentForm(postId: number) {
    this.commentForm = this.fb.group({
      content: [
        { value: '', disabled: this.isSubmitting },
        [Validators.required, Validators.maxLength(1000)],
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
    const commentDto: CommentDto = this.commentForm.value;
    this.commentService.addComment(commentDto).subscribe({
      next: (response) => {
        this.toastr.success('Comment added successfully!', 'Success');
        this.comments.push({
          userName: response.UserName,
          content: this.commentForm.value.content,
          createdDate: new Date().toISOString(),
        });
        this.changeDetectorRef.detectChanges();
        this.commentForm.reset({ content: '', postId: this.post.id });
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
}
