import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillBoardCardComponent } from './bill-board-card.component';

describe('BillBoardCardComponent', () => {
  let component: BillBoardCardComponent;
  let fixture: ComponentFixture<BillBoardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillBoardCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillBoardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
