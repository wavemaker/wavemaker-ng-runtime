import {Directive, Injector, OnDestroy, Optional} from '@angular/core';

import {Viewport, ViewportEvent} from '@wm/core';
import { registerProps } from './custom-widget-prop';
import { StylableComponent, provideAsWidgetRef } from '@wm/components/base';

const DEFAULT_CLS = 'app-custom-widget-container clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-custom-widget-container', hostClass: DEFAULT_CLS};
declare const _;

@Directive({
    selector: '[wmCustomWidget]',
    providers: [
        provideAsWidgetRef(CustomWidgetDirective)
    ]
})
export class CustomWidgetDirective extends StylableComponent implements OnDestroy {
    static initializeProps = registerProps();
    constructor(inj: Injector, private viewport: Viewport) {
        super(inj, WIDGET_CONFIG);

        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.RESIZE, data => this.callback('resize', data)));
        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.ORIENTATION_CHANGE, data => this.callback('orientationchange', data)));
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
        super.ngOnDestroy();
    }

}
