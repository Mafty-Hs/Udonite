import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDataCardComponent } from './common-data-card.component';

describe('CommonDataCardComponent', () => {
  let component: CommonDataCardComponent;
  let fixture: ComponentFixture<CommonDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDataCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
