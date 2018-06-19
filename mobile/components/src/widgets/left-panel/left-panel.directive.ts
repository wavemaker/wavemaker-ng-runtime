import { Directive, ElementRef, OnDestroy } from '@angular/core';

import { LeftPanelDirective, PageDirective } from '@wm/components';
import { addClass } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';

@Directive({
    selector: '[wmLeftPanel]'
})
export class MobileLeftPanelDirective implements OnDestroy {

    private _backBtnListenerDestroyer;

    constructor(
        private page: PageDirective,
        private leftPanelRef: LeftPanelDirective,
        private deviceService: DeviceService,
        elRef: ElementRef
    ) {
        addClass(elRef.nativeElement, 'wm-mobile-app-left-panel');
        page.notify('wmLeftPanel:ready', leftPanelRef);
        page.subscribe('wmLeftPanel:expand', () => {
            this._backBtnListenerDestroyer = deviceService.onBackButtonTap(() => {
                leftPanelRef.collapse();
                return false;
            });
        });
        page.subscribe('wmLeftPanel:collapse', () => {
            this.destroyBackBtnListener();
        });
    }

    public ngOnDestroy() {
        this.destroyBackBtnListener();
    }

    private destroyBackBtnListener() {
        if (this._backBtnListenerDestroyer) {
            this._backBtnListenerDestroyer();
            this._backBtnListenerDestroyer = null;
        }
    }
}
