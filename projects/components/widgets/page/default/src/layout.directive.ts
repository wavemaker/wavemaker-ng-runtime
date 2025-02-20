import {AfterViewInit, Directive, Inject, Injector, Optional} from '@angular/core';

import {EventNotifier} from '@wm/core';
import { updateDeviceView, provideAsWidgetRef, StylableComponent } from '@wm/components/base';

import { registerProps } from './layout.props';

const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = {widgetType: 'wm-layout', hostClass: DEFAULT_CLS};

@Directive({
  standalone: true,
    selector: '[wmLayout]',
    providers: [
        provideAsWidgetRef(LayoutDirective)
    ],
    exportAs: 'wmLayout'
})
export class LayoutDirective extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    private _eventNotifier = new EventNotifier(false);

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }

    /**
     * A child component can notify page using this method. Notified event will be passed to
     * subscribed children only after page initialization.
     *
     * @param {string} eventName
     * @param data
     */
    public notify(eventName: string, ...data: Array<any>) {
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            updateDeviceView(this.nativeElement, this.getAppInstance().isTabletApplicationType);
        }, 1);
    }
}
