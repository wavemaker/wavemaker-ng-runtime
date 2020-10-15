import { Injectable } from '@angular/core';
import { EventNotifier } from '../utils/event-notifier';

const MINIMUM_TAB_WIDTH = 768;
const MINIMUM_LARGE_SCREEN_WIDTH = 1200;

const enum SCREEN_TYPE {
    MOBILE,
    TABLET,
    LARGE_SCREEN_DEVICES
}

@Injectable({providedIn: 'root'})
export class Screen {
    public orientation = {
        isPortrait: false,
        isLandscape: false
    };
    private type;
    public _eventNotifier = new EventNotifier(true);
    private screenWidth;
    private screenHeight;

    get isMobileType() {
        return this.type === SCREEN_TYPE.MOBILE;
    }

    get isTabletType() {
        return this.type === SCREEN_TYPE.TABLET;
    }

    constructor() {
        this.setScreenType();

        window.addEventListener('resize', $event => {
            this.setScreenType();
            this._eventNotifier.notify('on-resize', {$event, screenWidth: this.screenWidth, screenHeight: this.screenHeight});
        });

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
            this._eventNotifier.notify('on-orientationchange', { $event });
        });
    }

    private setScreenType() {
        const $el = document.querySelector('.wm-app');
        this.screenWidth = $el.clientWidth;
        this.screenHeight = $el.clientHeight;

        if (this.screenWidth >= MINIMUM_LARGE_SCREEN_WIDTH || this.screenHeight >= MINIMUM_LARGE_SCREEN_WIDTH) {
            this.type = SCREEN_TYPE.LARGE_SCREEN_DEVICES;
            return; // this specifies that it is large screen device.
        }
        if (this.screenWidth >= MINIMUM_TAB_WIDTH || this.screenHeight >= MINIMUM_TAB_WIDTH) {
            this.type = SCREEN_TYPE.TABLET;
        } else {
            this.type = SCREEN_TYPE.MOBILE;
        }
    }
}
