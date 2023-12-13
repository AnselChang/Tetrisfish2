import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelContainerComponent } from './level-container.component';

describe('LevelContainerComponent', () => {
  let component: LevelContainerComponent;
  let fixture: ComponentFixture<LevelContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LevelContainerComponent]
    });
    fixture = TestBed.createComponent(LevelContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
