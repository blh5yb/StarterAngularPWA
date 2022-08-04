import { TestBed, inject } from '@angular/core/testing';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

import { ErrorService } from './error.service';

//const functionsStub = {
//  httpsCallable: jasmine.createSpy('httpsCallable')
//}

describe('ErrorService', () => {
  let service: ErrorService;
  let functions: AngularFireFunctions;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorService,
      {provide: AngularFireFunctions, useValue: spyOn}
    ]
    });
    service = TestBed.inject(ErrorService);
    functions = TestBed.inject(AngularFireFunctions) as jasmine.SpyObj<AngularFireFunctions>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(functions.httpsCallable).toHaveBeenCalled()
  });
});