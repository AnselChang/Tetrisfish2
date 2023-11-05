import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalibratePageComponent } from './calibrate-page.component';

describe('CalibratePageComponent', () => {
  let component: CalibratePageComponent;
  let fixture: ComponentFixture<CalibratePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalibratePageComponent]
    });
    fixture = TestBed.createComponent(CalibratePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
