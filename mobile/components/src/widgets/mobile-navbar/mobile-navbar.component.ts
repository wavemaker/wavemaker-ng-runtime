import { Component, Injector, OnDestroy } from '@angular/core';

import { BaseComponent, getImageUrl, IWidgetConfig, LeftPanelDirective, PageDirective, provideAsWidgetRef } from '@wm/components';
import { App } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';

import { registerProps } from './mobile-navbar.props';

registerProps();

const DEFAULT_CLS = 'app-header app-mobile-navbar';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-mobile-navbar', hostClass: DEFAULT_CLS};

@Component({
    selector: 'header[wmMobileNavbar]',
    templateUrl: './mobile-navbar.component.html',
    providers: [
        provideAsWidgetRef(MobileNavbarComponent)
    ]
})
export class MobileNavbarComponent extends BaseComponent implements OnDestroy {

    public datavalue: string;
    public imagesrc: string;
    public leftNavPanel: LeftPanelDirective;
    public showLeftnavbtn: boolean;
    public showSearchbar: boolean;

    private _backBtnListenerDestroyer;

    constructor(
        app: App,
        private page: PageDirective,
        private deviceService: DeviceService,
        inj: Injector
    ) {
        super(inj, WIDGET_CONFIG);
        page.subscribe('wmLeftPanel:ready', (leftNavPanel: LeftPanelDirective) => {
            if (this.showLeftnavbtn) {
                this.leftNavPanel = leftNavPanel;
            }
        });
        this._backBtnListenerDestroyer = deviceService.onBackButtonTap($event => {
            if (app.landingPageName === app.activePageName) {
                window.navigator['app'].exitApp();
            } else {
                this.goBack($event);
            }
            return false;
        });
    }


    public goBack($event): void {
        if (this.hasEventCallback('backbtnclick')) {
            this.invokeEventCallback('backbtnclick', {$event});
        } else {
            window.history.go(-1);
        }
    }

    public ngOnDestroy() {
        this._backBtnListenerDestroyer();
        super.ngOnDestroy();
    }

    public onPropertyChange(key, nv, ov?) {
        if (key === 'imgsrc') {
            this.imagesrc = getImageUrl(nv);
        } else if (key === 'dataset') {
            // $is._dataset = nv;
        } else if (key === 'defaultview') {
            this.showSearchbar = (nv === 'searchview');
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public onSubmission($event, widget, value): void {
        this.datavalue = value;
        this.invokeEventCallback('search', {$event});
    }

}
