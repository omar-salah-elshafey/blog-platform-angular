import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyResetPasswordTokenComponent } from './verify-reset-password-token.component';

describe('VerifyResetPasswordTokenComponent', () => {
  let component: VerifyResetPasswordTokenComponent;
  let fixture: ComponentFixture<VerifyResetPasswordTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyResetPasswordTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyResetPasswordTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
