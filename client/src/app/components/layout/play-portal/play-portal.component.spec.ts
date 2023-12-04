import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayPortalComponent } from './play-portal.component';

describe('PlayPortalComponent', () => {
  let component: PlayPortalComponent;
  let fixture: ComponentFixture<PlayPortalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayPortalComponent]
    });
    fixture = TestBed.createComponent(PlayPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
