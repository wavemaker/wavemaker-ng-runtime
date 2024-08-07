import {Directive, DoCheck, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';

import { App, debounce, isKitkatDevice, isMobileApp } from '@wm/core';
import {forEach, includes} from "lodash-es";

declare const $;
declare const IScroll;

@Directive({
    selector: '[wmSmoothscroll]'
})
export class SmoothScrollDirective implements OnInit, DoCheck, OnDestroy {

    private readonly _$el;
    private _isEnabled = false;
    private _smoothScrollInstance;
    private _lastScrollY = -1;
    private _waitRefreshTill = -1;
    private app: App;
    private pendingIscrolls: any = [];
    private cancelSubscription: any;

    constructor(inj: Injector, elRef: ElementRef, app: App) {
        this._$el = $(elRef.nativeElement);
        this.app = app;
    }

    public ngOnInit() {
        this.cancelSubscription = this.app.subscribe('no-iscroll', el => {
            this.pendingIscrolls.push(el);
        });
    }

    public ngDoCheck() {
        if (this._isEnabled) {
            if (!this._smoothScrollInstance) {
                this._smoothScrollInstance = this.applySmoothScroll();
            } else {
                this.refreshIScroll();
            }
        } else if (this._smoothScrollInstance && this._smoothScrollInstance.destroy) {
            this._smoothScrollInstance.destroy();
        }
    }

    public ngOnDestroy() {
        if (this._smoothScrollInstance && this._smoothScrollInstance.destroy) {
            this._smoothScrollInstance.destroy();
        }
        if (this.cancelSubscription) {
            this.cancelSubscription();
        }
    }

    @Input()
    set wmSmoothscroll(val: any) {
        this._isEnabled = (val === true || val === 'true');
        if (this._isEnabled) {
            if (!this._smoothScrollInstance) {
                this._smoothScrollInstance = this.applySmoothScroll();
            }
        } else {
            this.ngOnDestroy();
        }
    }

    private applySmoothScroll($events?: any[], activeEl?: any) {
        if (!isMobileApp() || isKitkatDevice()) {
            return null;
        }
        // Set the fadeScrollbars to true only when content is scrollable inside the smoothscroll-container
        const scrollOptions = {
            scrollbars: true,
            preventDefault: false,
            momentum: true,
            bounce: false,
            mouseWheel: true, // for preview in browser support
            disablePointer: true, // disable the pointer events as it causes lag in scrolling (jerky).
            disableTouch: false, // false to be usable with touch devices
            disableMouse: false // false to be usable with a mouse (desktop)
        },
        el = this._$el[0];

        if (!el.children.length) {
            return null;
        }

        this._$el.addClass('smoothscroll-wrapper');
        /*  WMS-17904
        document.scrollIntoView overrides default iScroll scroll,
        so the fix is done to ensure, the scroll action from 'scrollIntoView'
        is captured & executed through iScroll APIs
        */
        el.onscroll = function(e) {
            if (e.target.iscroll && e.target.scrollTop) {
                e.target.iscroll.scrollTo(
                    e.target.iscroll.x,
                    e.target.iscroll.y - e.target.scrollTop
                );
                e.target.scrollTop = 0;
            }
        };
        if (activeEl && activeEl.tagName === 'INPUT') {
            activeEl.focus();
        }

        // Add fadeScrollbars options only when smoothscroll container is included, which means content is scrollable.
        if ($events) {
            scrollOptions['fadeScrollbars'] = true;
        }

        let iScroll = new IScroll(el, scrollOptions);

        if ($events) {
            // map all events on previous iscroll to the newly created iscroll.
            forEach($events, (listeners, key) => {
                forEach(listeners, l => {
                    iScroll.on(key, l);
                });
            });
            const scope = this;
            iScroll.on('scrollStart', function () {
                this._scrolling = true;
                //will notify the components which want to subscribe upon scrolling.
                if (isMobileApp()) {
                    scope.app.notify('iscroll-start',{});
                }
            });
            iScroll.on('scrollEnd', function () {
                this._scrolling = false;
            });
            iScroll.refresh();
        }

        this.app.notify('iscroll-start',{});

        // refresh the indicators.
        iScroll.indicatorRefresh = () => {
            const indicators = this._$el[0].iscroll.indicators;
            let i;
            if (indicators.length) {
                for (i = 0; i < indicators.length; i++) {
                    indicators[i].refresh();
                }
            }
        };

        this._$el[0].iscroll = iScroll;
        forEach(this.pendingIscrolls, (_el, index) => {
            if (_el.isSameNode(this._$el[0])) {
                this.app.notify('iscroll-update', {el: _el});
                this.pendingIscrolls.splice(index, 1);
                return;
            }
        });
        this.app.notify('iscroll-update', {});

        return {
            iScroll: iScroll,
            destroy: function () {
                iScroll.destroy();
                $(iScroll.scroller).css({
                    'transition-timing-function': '',
                    'transition-duration': '',
                    'transform': ''
                });

                iScroll = null;
                delete el.iscroll;
            }
        };
    }

    /*
     * When element has scroll (i.e. scrollHeight > clientHeight), a div with smoothscroll-container class will be added.
     * new iScroll will be initialised on the element after the div addition, by removing the existing iscroll on the element.
     * This div will have no height, so the elements inside this div will inherit this height, i.e. no height,
     * Scenario: tabs with 100% height, as it covers the pageContent with no scroll, this div will not be added.
     * TODO: Scenario: tabs with 100% height and add others widgets after/before, as it has scroll, this div will be added.
     *          But tabs having 100% height will not be honoured as div is having no height.
     */
    private refreshIScroll() {
        const iScroll = this._smoothScrollInstance.iScroll;
        const waitTime = 500;
        if (iScroll._scrolling || this._waitRefreshTill > Date.now()) {
            return;
        }
        // Check for scrollable content and if smoothscroll-container div is already added.
        if (iScroll.wrapper
            && !includes(iScroll.wrapper.children[0].classList, 'smoothscroll-container')
            && iScroll.wrapper.scrollHeight > iScroll.wrapper.clientHeight) {

            const cloneEvents = iScroll._events;
            const prevActiveEl = document.activeElement;

            // Adds the smoothscroll container div wrapper only when element has scrollable content.
            $(iScroll.wrapper.children).wrapAll('<div class="smoothscroll-container"></div>');
            this._smoothScrollInstance.destroy();

            // create new iscroll instance on the element
            this._smoothScrollInstance = this.applySmoothScroll(cloneEvents, prevActiveEl);
        }
        if (this._lastScrollY !== this._$el[0].iscroll.maxScrollY) {
            refreshIscrolls(this._smoothScrollInstance.iScroll);
            this._lastScrollY = this._$el[0].iscroll.maxScrollY;
        } else {
            this._smoothScrollInstance.iScroll.refresh();
        }
        this._waitRefreshTill = Date.now() + waitTime;
    }
}

/**
 * Refreshes the given iScorll or all iScrolls in the page.
 * @param iScroll
 */
const refreshIscrolls = function(iScroll?: any) {
    const scrollContainer = !iScroll && $('.smoothscroll-container');

    // Fix for issue: keyboard hides the input on focus.
    // On input focus or window resize, keypad in device has to adjust.
    let bScrollIntoView = iScroll && iScroll.wrapper && iScroll.wrapper.contains(document.activeElement);
    if (bScrollIntoView && document.activeElement.tagName === 'INPUT' && ($(document.activeElement).offset().top + document.activeElement.clientHeight) > window.innerHeight * 0.9) {
        document.activeElement.scrollIntoView({behavior: 'auto', block: 'end', inline: 'end'});
    }

    if (iScroll) {
        // refresh specify iscroll on change.
        if (iScroll.indicatorRefresh) {
            iScroll.indicatorRefresh();
        }
        if (iScroll.refresh) {
            iScroll.refresh();
        }
    } else if (scrollContainer.length) {
        // refresh all the iscrolls in pagecontent.
        scrollContainer.parent().each( (i, el: any) => {
            el.iscroll.indicatorRefresh();
            el.iscroll.refresh();
        });
    }
};

// on window resize, recalculate the iscroll position and refresh scrollers.
window.addEventListener('resize', debounce(refreshIscrolls, 200));
