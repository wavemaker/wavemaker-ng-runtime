import { ApplicationRef, Component, DoCheck } from '@angular/core';
import { PipeProvider } from '@runtime/services/pipe-provider.service';
import { setPipeProvider } from '@utils/src/expression-parser';
import { $invokeWatchers, setAppRef } from '@utils/src/watcher';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})

export class AppComponent implements DoCheck {
    title: string = 'app';
    iconSize: string = '20px';

    constructor(pipeProvider: PipeProvider, _appRef: ApplicationRef) {
        setPipeProvider(pipeProvider);
        setAppRef(_appRef);
    }

    toggleConfig = {
        'basic': true,
        'input': true,
        'layout': true
    };

    toggleNav(category: string): void {
        const self = this,
            props = Object.keys(self.toggleConfig);

        props.forEach(function (prop) {
            self.toggleConfig[prop] = true;
        });

        self.toggleConfig[category] = false;
    }

    ngDoCheck() {
        $invokeWatchers();
    }
}
