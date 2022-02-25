import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCutinComponent } from './help-cutin.component';

describe('HelpCutinComponent', () => {
  let component: HelpCutinComponent;
  let fixture: ComponentFixture<HelpCutinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpCutinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpCutinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
