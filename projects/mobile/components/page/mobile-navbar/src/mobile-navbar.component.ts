import {AfterViewInit, Attribute, Component, Inject, Injector, OnDestroy, Optional, ViewChild} from '@angular/core';

import {AbstractNavigationService, App} from '@wm/core';
import { BaseComponent, getImageUrl, IWidgetConfig, provideAsWidgetRef } from '@wm/components/base';
import { PageDirective } from '@wm/components/page';
import { LeftPanelDirective } from '@wm/components/page/left-panel';
import { SearchComponent } from '@wm/components/basic/search';
import { DeviceService } from '@wm/mobile/core';

import { registerProps } from './mobile-navbar.props';

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
    static initializeProps = registerProps();

    private _isReady = false;
    public datavalue: string;
    public imagesrc: string;
    public query: string;
    public leftNavPanel: LeftPanelDirective;
    public showLeftnavbtn: boolean;
    public showSearchbar: boolean;
    public backbuttoniconclass: any;

    private _backBtnListenerDestroyer;

    @ViewChild(SearchComponent, { static: true }) searchComponent: SearchComponent;
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
    private matchmode: string;

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
        @Attribute('backbtnclick.event') private backbtnClickEvt,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);
        page.subscribe('wmLeftPanel:ready', (leftNavPanel: LeftPanelDirective) => {
            if (this.showLeftnavbtn) {
                this.leftNavPanel = leftNavPanel;
            }
        });
        this._backBtnListenerDestroyer = deviceService.onBackButtonTap($event => {
            if (this._isReady) {
                if (this.backbtnClickEvt) {
                    this.invokeEventCallback('backbtnclick', {$event});
                    return false;
                }
            }
        });
        this.binddisplaylabel = this.nativeElement.getAttribute('displaylabel.bind');
        setTimeout(() => this._isReady = true, 1000);
    }

    ngAfterViewInit() {
        this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc;
        this.searchComponent.displayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        this.searchComponent.displaylabel =  this.displaylabel;
        this.searchComponent.binddisplaylabel = this.binddisplaylabel;
        this.searchComponent.datafield = this.datafield;
        this.searchComponent.binddataset = this.binddataset;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.datasource = this.datasource;
        this.searchComponent.matchmode = this.matchmode;
    }


    public goBack($event): void {
         /**
          * TODO: while trying navigating from details page to edit page in wavereads, app is navigating
          * as details -> editPage -> details. For now, keeping this callback to react after 1 second.
          */
         this.deviceService.executeBackTapListeners($event);
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
            if (key === 'displaylabel' ) {
                this.searchComponent.displaylabel = this.displaylabel;
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
    public goBacktoPreviousView($event) {
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
