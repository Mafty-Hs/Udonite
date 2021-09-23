import { TestBed } from '@angular/core/testing';

import { DiceBotService } from './dice-bot.service';

describe('DiceBotService', () => {
  let service: DiceBotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiceBotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
