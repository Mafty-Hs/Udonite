import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDicerollComponent } from './help-diceroll.component';

describe('HelpDicerollComponent', () => {
  let component: HelpDicerollComponent;
  let fixture: ComponentFixture<HelpDicerollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpDicerollComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpDicerollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
