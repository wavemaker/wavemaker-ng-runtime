import "jest-preset-angular/setup-jest";
import { ToastrModule } from 'ngx-toastr';
import { TestBed } from '@angular/core/testing';

// Mock global objects if necessary
global.jQuery = require("jquery");
global.$ = global.jQuery;

// Mock the datatable function
$.fn.datatable = jest.fn()

global._ = require("lodash");
global.moment = require("moment");
class IntersectionObserver {
    constructor(callback, options) {

    }

    observe(element) {

    }

    unobserve() {
        return null;
    }

    disconnect() {
        return null;
    }
}
global.IntersectionObserver = IntersectionObserver;
// jest.setup.js

// Mock MSCSSMatrix
class MockMSCSSMatrix {
    constructor() {
        // Initialize with default values or any necessary properties
    }

    // Add any methods that your tests might call
    setMatrixValue(value) {
        // Mock implementation of setMatrixValue
    }

    multiply(matrix) {
        // Mock implementation of multiply
        return this;
    }

    // Add other methods as needed
}

// Attach the mock to the global scope
global.MSCSSMatrix = MockMSCSSMatrix;

import "jquery-ui/ui/disable-selection.js";
import "jquery-ui/ui/version.js";
import "jquery-ui/ui/widget.js";
import "jquery-ui/ui/scroll-parent.js";
import "jquery-ui/ui/plugin.js";
import "jquery-ui/ui/data.js";
import "jquery-ui/ui/widgets/mouse.js";
import "jquery-ui/ui/widgets/resizable.js";
import "jquery-ui/ui/widgets/sortable.js";
import "jquery-ui/ui/widgets/draggable.js";
import "jquery-ui/ui/widgets/droppable.js";
import "libraries/scripts/jquery.ui.touch-punch/jquery.ui.touch-punch.min.js";
import "moment-timezone/builds/moment-timezone.min.js";
import "hammerjs/hammer.min.js";
import "iscroll/build/iscroll.js";
import "tabbable/dist/index.umd.min.js";
import "@wavemaker/focus-trap/dist/focus-trap.umd.min.js";



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
