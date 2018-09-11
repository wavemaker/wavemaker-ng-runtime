import { Attribute, ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { $parseEvent, addClass, App, getRouteNameFromLink, getUrlParams, openLink, removeClass, UserDefinedExecutionContext } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';

declare const _;

registerProps();

const DEFAULT_CLS = 'nav app-nav';
const WIDGET_CONFIG = {widgetType: 'wm-nav', hostClass: DEFAULT_CLS};

const NavClassMap = {
    pills: 'nav-pills',
    tabs: 'nav-tabs',
    navbar: 'navbar-nav'
};

@Component({
    selector: '[wmNav]',
    templateUrl: './nav.component.html',
    providers: [
        provideAsWidgetRef(NavComponent)
    ]
})
export class NavComponent extends DatasetAwareNavComponent implements OnInit {

    public selecteditem;
    public type;
    public disableMenuContext: boolean;
    public layout;

    private activeNavLINode: HTMLElement;
    private itemActionFn: Function;
    private pageScope: any;
    private get activePageName() {
        return this.app.activePageName;
    }

    constructor(
        inj: Injector,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private userDefinedExecutionContext: UserDefinedExecutionContext,
        private app: App,
        @Attribute('select.event') selectEventCB
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.disableMenuContext = !!selectEventCB;
        this.pageScope = this.viewParent;
    }


    private setNavType(type) {
        addClass(this.nativeElement, NavClassMap[type]);
    }

    private setNavLayout(layout) {
        addClass(this.nativeElement, `nav-${layout}`);
    }

    public onNavSelect($event: Event, item: any, liRef: HTMLElement) {

        if (this.activeNavLINode) {
            removeClass(this.activeNavLINode, 'active');
        }

        this.activeNavLINode = liRef;

        addClass(liRef, 'active');

        this.selecteditem = _.omit(item, ['children', 'value']);

        this.invokeEventCallback('select', {$event, $item: this.selecteditem});

        let itemLink = item.link;
        const itemAction = item.action;
        if (itemAction) {
            if (!this.itemActionFn) {
                this.itemActionFn = $parseEvent(itemAction);
            }

            this.itemActionFn(this.userDefinedExecutionContext, Object.create(item));
        } else if (itemLink) {
            if (itemLink.startsWith('#/')) {
                const queryParams = getUrlParams(itemLink);
                itemLink = getRouteNameFromLink(itemLink);
                this.router.navigate([itemLink], {queryParams});
            } else {
                openLink(itemLink);
            }
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.setNavType(this.type);
        this.setNavLayout(this.layout);
    }

    /**
     * invoked from the menu widget when a menu item is selected.
     * @param $event
     * @param widget
     * @param $item
     */
    onMenuItemSelect($event, widget, $item) {
        this.selecteditem = _.omit($item, ['children', 'value']);
        this.invokeEventCallback('select', {$event, $item: this.selecteditem});
    }
}
