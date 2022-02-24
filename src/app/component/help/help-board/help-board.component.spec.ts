import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpBoardComponent } from './help-board.component';

describe('HelpBoardComponent', () => {
  let component: HelpBoardComponent;
  let fixture: ComponentFixture<HelpBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
