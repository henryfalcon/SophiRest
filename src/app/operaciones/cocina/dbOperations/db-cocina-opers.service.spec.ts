import { TestBed } from '@angular/core/testing';

import { DbCocinaOpersService } from './db-cocina-opers.service';

describe('DbCocinaOpersService', () => {
  let service: DbCocinaOpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbCocinaOpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
