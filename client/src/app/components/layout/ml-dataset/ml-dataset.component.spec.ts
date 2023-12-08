import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlDatasetComponent } from './ml-dataset.component';

describe('MlDatasetComponent', () => {
  let component: MlDatasetComponent;
  let fixture: ComponentFixture<MlDatasetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MlDatasetComponent]
    });
    fixture = TestBed.createComponent(MlDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
