import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopmentTestbedComponent } from './development-testbed.component';

describe('DevelopmentTestbedComponent', () => {
  let component: DevelopmentTestbedComponent;
  let fixture: ComponentFixture<DevelopmentTestbedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevelopmentTestbedComponent]
    });
    fixture = TestBed.createComponent(DevelopmentTestbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
