import { TestBed, inject } from '@angular/core/testing';

import { VariablesService } from './variables.service';

describe('VariablesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VariablesService]
    });
  });

  it('should be created', inject([VariablesService], (service: VariablesService) => {
    expect(service).toBeTruthy();
  }));
});
