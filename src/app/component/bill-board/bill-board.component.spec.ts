import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillBoardComponent } from './bill-board.component';

describe('BillBoardComponent', () => {
  let component: BillBoardComponent;
  let fixture: ComponentFixture<BillBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
