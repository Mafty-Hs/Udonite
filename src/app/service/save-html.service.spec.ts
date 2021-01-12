import { TestBed } from '@angular/core/testing';

import { SaveHtmlService } from './save-html.service';

describe('SaveHtmlService', () => {
  let service: SaveHtmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveHtmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
