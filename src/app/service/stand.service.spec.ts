import { TestBed } from '@angular/core/testing';

import { StandService } from './stand.service';

describe('StandService', () => {
  let service: StandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
