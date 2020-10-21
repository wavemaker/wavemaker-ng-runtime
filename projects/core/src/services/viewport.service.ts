import { Injectable, OnDestroy } from '@angular/core';
import { EventNotifier } from '../utils/event-notifier';

const MINIMUM_TAB_WIDTH = 768;
const MINIMUM_LARGE_SCREEN_WIDTH = 1200;

const enum SCREEN_TYPE {
    MOBILE,
    TABLET,
    LARGE_SCREEN_DEVICES
}

export class IViewportService {
    notify: (eventname: ViewportEvent, options?: Array<any>) => void;
    subscribe: (eventname: ViewportEvent, callback: (data: any) => void) => void;
}

export const enum ViewportEvent {
    ORIENTATION_CHANGE = 'orientationchange',
    RESIZE = 'resize'
}

@Injectable({providedIn: 'root'})
export class Viewport implements IViewportService, OnDestroy {
    public orientation = {
        isPortrait: false,
        isLandscape: false
    };
    public isMobileType = false;
    public isTabletType = false;
    private type;
    public _eventNotifier = new EventNotifier(true);
    private screenWidth;
    private screenHeight;

    constructor() {
        this.setScreenType();

        window.addEventListener(ViewportEvent.RESIZE, this.resizeFn.bind(this));

        const query = window.matchMedia('(orientation: portrait)');
        if (query.matches) {
            this.orientation.isPortrait = true;
        } else {
            this.orientation.isLandscape = true;
        }

        // Add a media query change listener
        query.addEventListener('change', $event => {
            const isLandscape = !$event.matches;
            this.orientation.isPortrait = !isLandscape;
            this.orientation.isLandscape = isLandscape;
            this.notify(ViewportEvent.ORIENTATION_CHANGE, { $event, data: {isPortrait: !isLandscape, isLandscape: isLandscape} });
        });
    }

    private resizeFn($event) {
        this.setScreenType();
        this.notify(ViewportEvent.RESIZE, {$event, data: {screenWidth: this.screenWidth, screenHeight: this.screenHeight}});
    }

    public subscribe(eventName, callback: (data: any) => void): () => void {
        return this._eventNotifier.subscribe(eventName, callback);
    }

    public notify(eventName: string, ...data: Array<any>) {
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    }

    private setScreenType() {
        const $el = document.querySelector('.wm-app');
        if (!$el) {
            return;
        }
        this.screenWidth = $el.clientWidth;
        this.screenHeight = $el.clientHeight;

        this.isTabletType = false;
        this.isMobileType = false;

        if (this.screenWidth >= MINIMUM_LARGE_SCREEN_WIDTH || this.screenHeight >= MINIMUM_LARGE_SCREEN_WIDTH) {
            this.type = SCREEN_TYPE.LARGE_SCREEN_DEVICES;
            return; // this specifies that it is large screen device.
        }
        if (this.screenWidth >= MINIMUM_TAB_WIDTH || this.screenHeight >= MINIMUM_TAB_WIDTH) {
            this.type = SCREEN_TYPE.TABLET;
            this.isTabletType = true;
        } else {
            this.type = SCREEN_TYPE.MOBILE;
            this.isMobileType = true;
        }
    }

    ngOnDestroy() {
        this._eventNotifier.destroy();
        window.removeEventListener('resize', this.resizeFn);
    }
}
