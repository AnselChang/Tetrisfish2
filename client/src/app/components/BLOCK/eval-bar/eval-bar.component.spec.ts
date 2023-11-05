import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalBarComponent } from './eval-bar.component';

describe('EvalBarComponent', () => {
  let component: EvalBarComponent;
  let fixture: ComponentFixture<EvalBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvalBarComponent]
    });
    fixture = TestBed.createComponent(EvalBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
