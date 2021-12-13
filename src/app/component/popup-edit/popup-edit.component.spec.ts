import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditComponent } from './popup-edit.component';

describe('PopupEditComponent', () => {
  let component: PopupEditComponent;
  let fixture: ComponentFixture<PopupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
