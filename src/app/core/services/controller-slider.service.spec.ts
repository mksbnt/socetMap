import { TestBed } from '@angular/core/testing';

import { ControllerSliderService } from './controller-slider.service';

describe('ControllerSliderService', () => {
  let service: ControllerSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControllerSliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
