import { Injectable, OnDestroy } from '@angular/core';
import { EventNotifier } from '../utils/event-notifier';
import { isAndroid, isAndroidTablet, isIos, isIpad } from '../utils/utils';
import {get} from "lodash-es";

let MINIMUM_MOBILE_WIDTH = 480;
let MINIMUM_TAB_WIDTH = 768;
let MINIMUM_LARGE_SCREEN_WIDTH = 1200;

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
    private selectedViewPort: any;

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
        // addEventListener is not supported ios browser
        if (query.addEventListener) {
            query.addEventListener('change', $event => this.orientationChange($event, !$event.matches));
        }
    }

    update(selectedViewPort: Object) {
        this.selectedViewPort = selectedViewPort;
        this.setScreenType();
    }

    private orientationChange($event, isLandscape) {
        if (isLandscape !== this.orientation.isLandscape) {
            this.orientation.isPortrait = !isLandscape;
            this.orientation.isLandscape = isLandscape;
            this.notify(ViewportEvent.ORIENTATION_CHANGE, { $event, data: {isPortrait: !isLandscape, isLandscape: isLandscape} });
        }
    }

    private resizeFn($event) {
        const $el = document.querySelector('.wm-app');
        if (!$el) {
            return;
        }
        this.setScreenType();
        this.orientationChange($event, this.screenWidth >= this.screenHeight);
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
        this.screenWidth = $el.clientWidth;
        this.screenHeight = $el.clientHeight;

        var minValue = this.screenWidth < this.screenHeight ? this.screenWidth : this.screenHeight;
        var maxValue = this.screenWidth > this.screenHeight ? this.screenWidth : this.screenHeight;

        this.isTabletType = false;
        this.isMobileType = false;

        if (get(this.selectedViewPort, 'deviceCategory')) {
            const deviceCategory = this.selectedViewPort.deviceCategory;
            if (deviceCategory === 'Tab') {
                this.isTabletType = true;
            } else if (deviceCategory === 'Smartphone') {
                this.isMobileType = true;
            }
        } else {
             MINIMUM_MOBILE_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--screen-xs')) || 480;
             MINIMUM_TAB_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--screen-sm')) || 768;
             MINIMUM_LARGE_SCREEN_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--screen-lg')) || 1200;
            if (this.screenWidth >= MINIMUM_LARGE_SCREEN_WIDTH) {
                this.isTabletType = isAndroid() || isIos() || isAndroidTablet();
                this.isMobileType = false;
            } else if (this.screenWidth >= MINIMUM_TAB_WIDTH) {
                this.type = SCREEN_TYPE.TABLET;
                this.isTabletType = true;
            } else {
                this.type = SCREEN_TYPE.MOBILE;
                this.isMobileType = true;
            }
        }
    }

    ngOnDestroy() {
        this._eventNotifier.destroy();
        window.removeEventListener('resize', this.resizeFn);
    }
}
