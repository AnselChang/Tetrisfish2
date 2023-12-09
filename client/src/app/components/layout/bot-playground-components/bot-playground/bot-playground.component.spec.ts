import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotPlaygroundComponent } from './bot-playground.component';

describe('BotPlaygroundComponent', () => {
  let component: BotPlaygroundComponent;
  let fixture: ComponentFixture<BotPlaygroundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BotPlaygroundComponent]
    });
    fixture = TestBed.createComponent(BotPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
