import { TestBed } from '@angular/core/testing';

import { PostLikesService } from './post-likes.service';

describe('PostLikesService', () => {
  let service: PostLikesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostLikesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
