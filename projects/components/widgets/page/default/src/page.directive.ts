import { AfterViewInit, Directive, Injector, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { EventNotifier } from '@wm/core';
import { updateDeviceView, provideAsWidgetRef, StylableComponent } from '@wm/components/base';

import { registerProps } from './page.props';

const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = {widgetType: 'wm-page', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPage]',
    providers: [
        provideAsWidgetRef(PageDirective)
    ]
})
export class PageDirective extends StylableComponent implements AfterViewInit, OnDestroy {
    static initializeProps = registerProps();

    private _eventNotifier = new EventNotifier(false);

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    constructor(inj: Injector, private titleService: Title) {
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

    /**
     * The main purpose of this function is to provide communication between page children objects.
     * Child component can subscribe for an event that will be emitted by another child component.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {any}
     */
    public subscribe(eventName, callback: (data: any) => void): () => void {
        return this._eventNotifier.subscribe(eventName, callback);
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this._eventNotifier.start();
            updateDeviceView(this.nativeElement, this.getAppInstance().isTabletApplicationType);
        }, 1);
    }

    public ngOnDestroy() {
        this._eventNotifier.destroy();
    }
}
