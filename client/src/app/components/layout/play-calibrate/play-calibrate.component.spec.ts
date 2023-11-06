import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayCalibrateComponent } from './play-calibrate.component';

describe('PlayCalibrateComponent', () => {
  let component: PlayCalibrateComponent;
  let fixture: ComponentFixture<PlayCalibrateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayCalibrateComponent]
    });
    fixture = TestBed.createComponent(PlayCalibrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
