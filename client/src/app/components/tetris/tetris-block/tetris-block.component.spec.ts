import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrisBlockComponent } from './tetris-block.component';

describe('TetrisBlockComponent', () => {
  let component: TetrisBlockComponent;
  let fixture: ComponentFixture<TetrisBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TetrisBlockComponent]
    });
    fixture = TestBed.createComponent(TetrisBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
