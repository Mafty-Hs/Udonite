import { TestBed } from '@angular/core/testing';

import { GameCharacterService } from './game-character.service';

describe('GameCharacterService', () => {
  let service: GameCharacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameCharacterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
