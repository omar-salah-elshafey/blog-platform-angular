import { Component, OnInit } from '@angular/core';
import {
  PostResponseModel,
  PostService,
} from '../../services/post/post.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-post',
  imports: [CommonModule, RouterModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
  post!: PostResponseModel;
  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const postId = params.get('postId');
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
}
