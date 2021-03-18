import { TestBed } from '@angular/core/testing';

import { SidenavOperService } from './sidenav-oper.service';

describe('SidenavOperService', () => {
  let service: SidenavOperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidenavOperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
