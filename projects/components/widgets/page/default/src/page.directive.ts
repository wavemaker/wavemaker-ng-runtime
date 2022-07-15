import { AfterViewInit, Directive, Injector } from '@angular/core';

import { EventNotifier } from '@wm/core';
import { updateDeviceView, provideAsWidgetRef, StylableComponent } from '@wm/components/base';

import { registerProps } from './page.props';

const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = {widgetType: 'wm-page', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPage]',
    providers: [
        provideAsWidgetRef(PageDirective)
    ],
    exportAs: 'wmPage'
})
export class PageDirective extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();
    public cache: boolean;

    private _eventNotifier = new EventNotifier(false);

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
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
