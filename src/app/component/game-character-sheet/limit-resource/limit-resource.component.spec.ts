import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitResourceComponent } from './limit-resource.component';

describe('LimitResourceComponent', () => {
  let component: LimitResourceComponent;
  let fixture: ComponentFixture<LimitResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
