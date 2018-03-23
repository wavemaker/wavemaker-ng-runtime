import { Component, DoCheck, ApplicationRef } from '@angular/core';
import { PipeProvider } from './services/pipe-provider.service';
import { setPipeProvider } from '@utils/expression-parser';
import { $invokeWatchers, setAppRef } from '@utils/watcher';
import { _WM_APP_PROJECT } from '@utils/utils';

@Component({
    selector: 'div#wm-app-content',
    template: '<router-outlet></router-outlet>'
})
export class AppComponent implements DoCheck {
    constructor(_pipeProvider: PipeProvider, _appRef: ApplicationRef) {
        setPipeProvider(_pipeProvider);
        setAppRef(_appRef);
        _WM_APP_PROJECT.id = location.href.split('/')[3];
    }

    ngDoCheck() {
        $invokeWatchers();
    }
}
