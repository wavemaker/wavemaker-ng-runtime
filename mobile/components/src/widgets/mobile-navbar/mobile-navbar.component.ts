import { AfterViewInit, Attribute, Component, Injector, OnDestroy, ViewChild } from '@angular/core';

import { BaseComponent, getImageUrl, IWidgetConfig, LeftPanelDirective, PageDirective, provideAsWidgetRef, SearchComponent } from '@wm/components';
import { App, AbstractNavigationService } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';

import { registerProps } from './mobile-navbar.props';

registerProps();

const DEFAULT_CLS = 'app-mobile-header app-mobile-navbar';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-mobile-navbar', hostClass: DEFAULT_CLS};

@Component({
    selector: 'header[wmMobileNavbar]',
    templateUrl: './mobile-navbar.component.html',
    providers: [
        provideAsWidgetRef(MobileNavbarComponent)
    ]
})
export class MobileNavbarComponent extends BaseComponent implements OnDestroy, AfterViewInit {

    private _isReady = false;

    public datavalue: string;
    public imagesrc: string;
    public query: string;
    public leftNavPanel: LeftPanelDirective;
    public showLeftnavbtn: boolean;
    public showSearchbar: boolean;

    private _backBtnListenerDestroyer;

    @ViewChild(SearchComponent) searchComponent: SearchComponent;
    private searchkey: string;
    private dataset: any;
    private binddataset: any;
    private datafield: string;
    private binddisplaylabel: string;
    private displaylabel: string;
    private binddisplayimagesrc: string;
    private displayimagesrc: string;
    private _datasource: any;
    private defaultview: string;

    // getter setter is added to pass the datasource to searchcomponent.
    get datasource () {
        return this._datasource;
    }

    set datasource(nv) {
        this._datasource = nv;
        this.searchComponent.datasource = nv;
    }

    constructor(
        app: App,
        private page: PageDirective,
        private deviceService: DeviceService,
        private navigationService: AbstractNavigationService,
        inj: Injector,
        @Attribute('backbtnclick.event') private backbtnClickEvt
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
        setTimeout(() => this._isReady = true, 1000);
    }

    ngAfterViewInit() {
        this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc;
        this.searchComponent.displayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
        this.searchComponent.datafield = this.datafield;
        this.searchComponent.binddataset = this.binddataset;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.datasource = this.datasource;
    }


    public goBack($event): void {
         /**
          * TODO: while trying navigating from details page to edit page in wavereads, app is navigating
          * as details -> editPage -> details. For now, keeping this callback to react after 1 second.
          */
        if (this._isReady) {
            if (this.backbtnClickEvt) {
                this.invokeEventCallback('backbtnclick', {$event});
            } else {
                this.navigationService.goToPrevious();
            }
        }
    }

    public ngOnDestroy() {
        this._backBtnListenerDestroyer();
        super.ngOnDestroy();
    }

    public onPropertyChange(key, nv, ov?) {
        if (this.searchComponent) {
            if (key === 'datafield') {
                this.searchComponent.datafield = this.datafield;
            }
            if (key === 'displaylabel') {
                this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
            }
        }

        if (key === 'imgsrc') {
            this.imagesrc = getImageUrl(nv);
        } else if (key === 'dataset') {
            // $is._dataset = nv;
        } else if (key === 'defaultview') {
            this.showSearchbar = (nv === 'searchview');
        } else if (key === 'datavalue') {
            this.query = nv;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public onSubmission($event): void {
        this.invokeEventCallback('search', {$event});
    }

    // switches the view based on defaultview
    private switchView(view) {
        this.showSearchbar = (view !== 'actionview');
    }

    // goto previous view or page
    private goBacktoPreviousView($event) {
        if (this.defaultview === 'actionview') {
            // switches the view from search to action or action to search.
            this.switchView('actionview');
        } else {
            // goes back to the previous visited page.
            this.goBack($event);
        }
    }

    private onSelect($event, widget, selectedValue) {
        this.datavalue = selectedValue;
        this.query = widget.query;
        this.invokeEventCallback('change', {
            $event,
            newVal: selectedValue,
            oldVal: widget.prevDatavalue
        });
    }

    private onClear() {
        this.datavalue = '';
        this.query = '';
    }

}
