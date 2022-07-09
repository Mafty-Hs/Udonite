import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitResourceElementComponent } from './limit-resource-element.component';

describe('LimitResourceElementComponent', () => {
  let component: LimitResourceElementComponent;
  let fixture: ComponentFixture<LimitResourceElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitResourceElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitResourceElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
