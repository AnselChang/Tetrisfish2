import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardCreationPageComponent } from './board-creation-page.component';

describe('BoardCreationPageComponent', () => {
  let component: BoardCreationPageComponent;
  let fixture: ComponentFixture<BoardCreationPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardCreationPageComponent]
    });
    fixture = TestBed.createComponent(BoardCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
