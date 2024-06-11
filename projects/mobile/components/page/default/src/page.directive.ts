import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

import { addClass, AbstractNavigationService, App } from '@wm/core';
import { PageDirective } from '@wm/components/page';
import { DeviceService } from '@wm/mobile/core';
import {remove} from "lodash-es";

declare const $;
@Directive({
    selector: '[wmPage]'
})
export class MobilePageDirective implements OnDestroy {

    private _$ele;

    private subscriptions: Subscription[] = [];
    private _backBtnListenerDestroyer;

    constructor(app: App,
                elRef: ElementRef,
                private modalService: BsModalService,
                private deviceService: DeviceService,
                private page: PageDirective,
                private navigationService: AbstractNavigationService) {
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', () => this._$ele.addClass('has-tabbar'));
        let modalsOpened = [];
        this.subscriptions = [
            modalService.onShown.subscribe(({id}) => {
                id && modalsOpened.push(id);
            }),
            modalService.onHidden.subscribe(({id}) => {
                id && remove(modalsOpened, id);
            })
        ];
        // add backbutton listener on every page.
        this._backBtnListenerDestroyer = deviceService.onBackButtonTap($event => {
            if (modalsOpened.length > 0) {
                modalService.hide(modalsOpened.pop());
            } else if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            } else {
                this.navigationService.goToPrevious();
            }
            return false;
        });
    }

    public ngOnDestroy() {
        this.subscriptions.map((s) => s.unsubscribe());
        this._backBtnListenerDestroyer();
    }
}
