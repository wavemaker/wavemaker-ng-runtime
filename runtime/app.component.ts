import { Component, DoCheck } from '@angular/core';
import { PipeProvider } from './services/pipe-provider.service';
import { setPipeProvider } from '@utils/expression-parser';
import { $digest } from '@utils/watcher';

@Component({
    selector: 'div#wm-app-content',
    template: '<router-outlet></router-outlet>'
})
export class AppComponent implements DoCheck {
    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }

    ngDoCheck() {
        $digest();
    }
}
