import "jest-preset-angular/setup-jest";
import { ToastrModule } from 'ngx-toastr';
import { TestBed } from '@angular/core/testing';

// Mock global objects if necessary
global.jQuery = require("jquery");
global.$ = global.jQuery;

global._ = require("lodash");
global.moment = require("moment");
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
