import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCounterComponent } from './help-counter.component';

describe('HelpCounterComponent', () => {
  let component: HelpCounterComponent;
  let fixture: ComponentFixture<HelpCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpCounterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
