import { Directive, Injector, OnDestroy } from '@angular/core';

import { Screen } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './partial.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-partial clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-partial', hostClass: DEFAULT_CLS};
declare const _;

@Directive({
    selector: '[wmPartial]',
    providers: [
        provideAsWidgetRef(PartialDirective)
    ]
})
export class PartialDirective extends StylableComponent implements OnDestroy {
    static initializeProps = registerProps();
    constructor(inj: Injector, private screen: Screen) {
        super(inj, WIDGET_CONFIG);

        this.registerDestroyListener(this.screen.subscribe('on-resize', data => this.callback('resize', data)));
        this.registerDestroyListener(this.screen.subscribe('on-orientationchange', data => this.callback('orientationchange', data)));
    }

    private callback(eventName, locals?: object) {
        locals = _.assign({ widget: this }, locals);
        this.invokeEventCallback(eventName, locals);
    }

    public ngOnAttach() {
        this.callback('attach');
    }

    public ngOnDetach() {
        this.callback('detach');
    }

    public ngOnDestroy() {
        this.callback('destroy');
    }

}
