import { TestBed } from '@angular/core/testing';

import { WebSocetService } from './web-socket.service';

describe('WebSocetService', () => {
  let service: WebSocetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
