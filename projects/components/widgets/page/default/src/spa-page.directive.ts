import {AfterViewInit, Directive, Injector, OnDestroy, Optional, SkipSelf} from '@angular/core';
import { Title } from '@angular/platform-browser';

import {EventNotifier, UserDefinedExecutionContext, Viewport, ViewportEvent} from '@wm/core';
import { updateDeviceView, provideAsWidgetRef, StylableComponent } from '@wm/components/base';

import { registerProps } from './spa-page.props';

const DEFAULT_CLS = 'app-spa-page';
const WIDGET_CONFIG = {widgetType: 'wm-spa-page', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmSpaPage]',
    providers: [
        provideAsWidgetRef(SpaPageDirective)
    ],
    exportAs: 'wmSpaPage'
})
export class SpaPageDirective extends StylableComponent implements AfterViewInit, OnDestroy {
    static initializeProps = registerProps();

    private _eventNotifier = new EventNotifier(false);
    public refreshdataonattach = true;
    public pagetitle: string;

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    constructor(inj: Injector, private titleService: Title, private viewport: Viewport, @SkipSelf() @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
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
        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.RESIZE, args => {
            this.invokeEventCallback('resize', { $event: args.$event, widget: this, data: args.data });
        }));
        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.ORIENTATION_CHANGE, args => {
            this.invokeEventCallback('orientationchange', { $event: args.$event, widget: this, data: args.data });
        }));
    }

    public ngOnAttach() {
        this.titleService.setTitle(this.pagetitle);
        this.invokeEventCallback('attach', { widget: this });
        this.notify('attach', {
            refreshData : this.refreshdataonattach
        });
    }

    public ngOnDetach() {
        this.invokeEventCallback('detach', { widget: this });
        this.notify('detach');
    }

    public ngOnDestroy() {
        this.invokeEventCallback('destroy', { widget: this });
        this._eventNotifier.destroy();
    }
}
