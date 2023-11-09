import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugGameComponent } from './debug-game.component';

describe('DebugGameComponent', () => {
  let component: DebugGameComponent;
  let fixture: ComponentFixture<DebugGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DebugGameComponent]
    });
    fixture = TestBed.createComponent(DebugGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
