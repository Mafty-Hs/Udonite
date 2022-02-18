import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpOtherComponent } from './help-other.component';

describe('HelpOtherComponent', () => {
  let component: HelpOtherComponent;
  let fixture: ComponentFixture<HelpOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpOtherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
