import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextBoxComponent } from './next-box.component';

describe('NextBoxComponent', () => {
  let component: NextBoxComponent;
  let fixture: ComponentFixture<NextBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NextBoxComponent]
    });
    fixture = TestBed.createComponent(NextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
