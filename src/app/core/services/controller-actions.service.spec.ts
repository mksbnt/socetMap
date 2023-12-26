import { TestBed } from '@angular/core/testing';

import { ControllerActionsService } from './controller-actions.service';

describe('ControllerActionsService', () => {
  let service: ControllerActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControllerActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
