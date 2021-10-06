import { TestBed } from '@angular/core/testing';

import { BillBoardService } from './bill-board.service';

describe('BillBoardService', () => {
  let service: BillBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
