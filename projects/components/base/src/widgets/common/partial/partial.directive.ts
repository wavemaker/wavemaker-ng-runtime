import {Directive, Inject, Injector, OnDestroy, Optional} from '@angular/core';

import {Viewport, ViewportEvent} from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './partial.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import {assign} from "lodash-es";

const DEFAULT_CLS = 'app-partial clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-partial', hostClass: DEFAULT_CLS};

@Directive({
  standalone: true,
    selector: '[wmPartial]',
    providers: [
        provideAsWidgetRef(PartialDirective)
    ]
})
export class PartialDirective extends StylableComponent implements OnDestroy {
    static initializeProps = registerProps();
    constructor(inj: Injector, private viewport: Viewport, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.RESIZE, data => this.callback('resize', data)));
        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.ORIENTATION_CHANGE, data => this.callback('orientationchange', data)));
    }

    private callback(eventName, locals?: object) {
        locals = assign({widget: this}, locals);
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
