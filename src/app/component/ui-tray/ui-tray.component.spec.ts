import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiTrayComponent } from './ui-tray.component';

describe('UiTrayComponent', () => {
  let component: UiTrayComponent;
  let fixture: ComponentFixture<UiTrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UiTrayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UiTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
