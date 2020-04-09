import { Directive, ElementRef, OnDestroy } from '@angular/core';

import { addClass, AbstractNavigationService, App } from '@wm/core';
import { PageDirective } from '@wm/components/page';
import { DeviceService } from '@wm/mobile/core';

declare const $;

@Directive({
    selector: '[wmPage]'
})
export class MobilePageDirective implements OnDestroy {

    private _$ele;

    private _backBtnListenerDestroyer;

    constructor(app: App,
                elRef: ElementRef,
                private deviceService: DeviceService,
                private page: PageDirective,
                private navigationService: AbstractNavigationService) {
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', () => this._$ele.addClass('has-tabbar'));

        // add backbutton listener on every page.
        this._backBtnListenerDestroyer = deviceService.onBackButtonTap($event => {
            if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            } else {
                this.navigationService.goToPrevious();
            }
            return false;
        });
    }

    public ngOnDestroy() {
        this._backBtnListenerDestroyer();
    }
}
