import { ApplicationRef, Component, DoCheck } from '@angular/core';
import { PipeProvider } from './services/pipe-provider.service';
import { $invokeWatchers, _WM_APP_PROJECT, setAppRef, setPipeProvider } from '@wm/utils';

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
