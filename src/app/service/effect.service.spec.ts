import { TestBed } from '@angular/core/testing';

import { EffectService } from './effect.service';

describe('EffectService', () => {
  let service: EffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
