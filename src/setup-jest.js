import "jest-preset-angular/setup-jest";
import { ToastrModule } from 'ngx-toastr';
import { TestBed } from '@angular/core/testing';

// Mock global objects if necessary
global.jQuery = require("jquery");
global.$ = global.jQuery;

global._ = require("lodash");
global.moment = require("moment");



beforeEach(() => {
  TestBed.configureTestingModule({
    imports : [
      ToastrModule.forRoot(),
    ],
  })
  Object.defineProperties(window, {
    location: {
      writable: true,
      value: {
        reload: jest.fn(),
      },
    },
  });
});
