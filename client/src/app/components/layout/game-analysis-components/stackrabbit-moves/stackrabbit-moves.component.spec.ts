import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackrabbitMovesComponent } from './stackrabbit-moves.component';

describe('StackrabbitMovesComponent', () => {
  let component: StackrabbitMovesComponent;
  let fixture: ComponentFixture<StackrabbitMovesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StackrabbitMovesComponent]
    });
    fixture = TestBed.createComponent(StackrabbitMovesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
