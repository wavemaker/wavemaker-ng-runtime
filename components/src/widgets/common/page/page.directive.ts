import { AfterViewInit, Directive, Injector, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';

import { isObject, noop } from '@wm/core';

import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './page.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';


registerProps();

const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = {widgetType: 'wm-page', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPage]',
    providers: [
        provideAsWidgetRef(PageDirective)
    ]
})
export class PageDirective extends StylableComponent implements AfterViewInit, OnDestroy {

    private _subject = new Subject();
    private _isInitialized = false;
    private _eventsBeforeInit = [];

    onPropertyChange(key, nv, ov) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
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
    public notify(eventName: string, data?: any) {
        if (this._isInitialized) {
            this._subject.next({
                name: eventName,
                data: data
            });
        } else {
            this._eventsBeforeInit.push({
                name: eventName,
                data: data
            });
        }
    }

    /**
     * The main purpose of this function is to provide communication between page children objects.
     * Child component can subscribe for an event that will be emitted by another child component.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {any}
     */
    public subscribe(eventName, callback: (data: any) => void) {
        let eventListener;
        if (eventName && callback) {
            eventListener = this._subject
                .subscribe((event: any) => {
                    if (event && isObject(event) && event.name === eventName) {
                        callback(event.data);
                    }
                });
            return () => {
                eventListener.destroy();
            };
        }
        return noop;
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this._isInitialized = true;
            this._eventsBeforeInit.forEach((event) => this._subject.next(event));
        }, 1);
    }

    public ngOnDestroy() {
        this._subject.complete();
    }
}
