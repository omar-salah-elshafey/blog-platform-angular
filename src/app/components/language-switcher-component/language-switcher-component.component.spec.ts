import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSwitcherComponentComponent } from './language-switcher-component.component';

describe('LanguageSwitcherComponentComponent', () => {
  let component: LanguageSwitcherComponentComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
