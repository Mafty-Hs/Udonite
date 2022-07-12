import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitResourceControlComponent } from './limit-resource-control.component';

describe('LimitResourceControlComponent', () => {
  let component: LimitResourceControlComponent;
  let fixture: ComponentFixture<LimitResourceControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitResourceControlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitResourceControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
