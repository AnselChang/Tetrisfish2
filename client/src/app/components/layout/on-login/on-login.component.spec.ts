import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnLoginComponent } from './on-login.component';

describe('OnLoginComponent', () => {
  let component: OnLoginComponent;
  let fixture: ComponentFixture<OnLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnLoginComponent]
    });
    fixture = TestBed.createComponent(OnLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
