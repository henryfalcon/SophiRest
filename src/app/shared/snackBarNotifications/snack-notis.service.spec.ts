import { TestBed } from '@angular/core/testing';

import { SnackNotisService } from './snack-notis.service';

describe('SnackNotisService', () => {
  let service: SnackNotisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackNotisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
