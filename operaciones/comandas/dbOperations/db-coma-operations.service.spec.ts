import { TestBed } from '@angular/core/testing';

import { DbComaOperationsService } from './db-coma-operations.service';

describe('DbComaOperationsService', () => {
  let service: DbComaOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbComaOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
