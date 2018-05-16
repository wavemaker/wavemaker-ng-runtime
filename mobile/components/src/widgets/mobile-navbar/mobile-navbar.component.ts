import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';

import { BaseComponent, IWidgetConfig, getImageUrl, PageDirective, LeftPanelDirective, provideAsWidgetRef } from '@wm/components';

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
export class MobileNavbarComponent extends BaseComponent {

    public datavalue: string;
    public imagesrc: string;
    public leftNavPanel: LeftPanelDirective;
    public showLeftnavBtn: boolean;
    public showSearchbar: boolean;

    constructor(private page: PageDirective, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(inj, WIDGET_CONFIG);
        page.subscribe('wmLeftPanel:ready', (leftNavPanel: LeftPanelDirective) => {
            this.showLeftnavBtn = true;
            this.leftNavPanel = leftNavPanel;
        });
    }


    public goBack($event): void {
        if (this.hasEventCallback('backbtnclick')) {
            this.invokeEventCallback('backbtnclick', {$event});
        } else {
            window.history.go(-1);
        }
    }

    public onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'imgsrc':
                this.imagesrc = getImageUrl(nv);
                break;
            case 'dataset':
                // $is._dataset = nv.data;
                break;
            case 'defaultview':
                this.showSearchbar = (nv === 'searchview');
                break;
        }
    }

    public onSubmission($event, widget, value): void {
        this.datavalue = value;
        this.invokeEventCallback('search', {$event});
    }

}
