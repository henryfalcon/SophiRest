import { TestBed } from '@angular/core/testing';

import { IsLoggedCanActivateGuard } from './is-logged-can-activate.guard';

describe('IsLoggedCanActivateGuard', () => {
  let guard: IsLoggedCanActivateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsLoggedCanActivateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
