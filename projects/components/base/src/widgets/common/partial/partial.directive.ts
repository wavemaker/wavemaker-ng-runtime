import { Directive, Injector, OnDestroy } from '@angular/core';

import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './partial.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-partial clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-partial', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPartial]',
    providers: [
        provideAsWidgetRef(PartialDirective)
    ]
})
export class PartialDirective extends StylableComponent implements OnDestroy {
    static initializeProps = registerProps();
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    public ngOnAttach() {
        this.invokeEventCallback('attach', { widget: this });
    }

    public ngOnDetach() {
        this.invokeEventCallback('detach', { widget: this });
    }

    public ngOnDestroy() {
        this.invokeEventCallback('destroy', { widget: this });
    }

}
