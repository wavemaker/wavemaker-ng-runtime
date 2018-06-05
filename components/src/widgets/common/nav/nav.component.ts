import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { addClass, switchClass, openLink, getUrlParams, getRouteFromNavLink } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';

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
export class NavComponent extends DatasetAwareNavComponent implements AfterViewInit, OnInit {

    public selecteditem;
    public type;
    public layout;
    public autoclose;

    constructor(
        inj: Injector,
        private cd: ChangeDetectorRef,
        private route: Router
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }


    private setNavType(type) {
        addClass(this.nativeElement, NavClassMap[type]);
    }

    private setNavLayout(layout) {
        addClass(this.nativeElement, `nav-${layout}`);
    }

    public onNavSelect($event, node, nodeRef) {
        Array.prototype.forEach.call(nodeRef.parentNode.children, function (childNode) {
            switchClass(childNode, '', 'active');
        });
        addClass(nodeRef, 'active');
        this.selecteditem = this.trimNode(node);
        this.invokeEventCallback('select', {$event, $item: this.selecteditem});
        if (node) {
            let itemLink: string = node.link;
            const itemAction: string = node.action;
            if (itemAction) {
                // evalExp(itemAction, node, (this.inj as any).view.context);
            } else if (itemLink) {
                if (itemLink.startsWith('#/')) {
                    const queryParams = getUrlParams(itemLink);
                    itemLink = getRouteFromNavLink(itemLink);
                    this.route.navigate([itemLink], {queryParams});
                } else {
                    openLink(itemLink);
                }
            }
        }
    }

    onPropertyChange(key, nv, ov) {
        super.onPropertyChange(key, nv, ov);
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
        this.selecteditem = this.trimNode($item);
        this.invokeEventCallback('select', {$event, $item: this.selecteditem});
    }

    onMenuHide() {
        this.cd.detectChanges();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }
}
