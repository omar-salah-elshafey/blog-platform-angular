import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDeletingConfermationComponent } from './post-deleting-confermation.component';

describe('PostDeletingConfermationComponent', () => {
  let component: PostDeletingConfermationComponent;
  let fixture: ComponentFixture<PostDeletingConfermationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDeletingConfermationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDeletingConfermationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
