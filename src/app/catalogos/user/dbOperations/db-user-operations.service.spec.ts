import { TestBed } from '@angular/core/testing';

import { DbUserOperationsService } from './db-user-operations.service';

describe('DbUserOperationsService', () => {
  let service: DbUserOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbUserOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
