import { TestBed } from '@angular/core/testing';

import { Lock } from './lock';

describe('Lock', () => {
  let service: Lock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
