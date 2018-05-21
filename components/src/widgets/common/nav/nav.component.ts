import { AfterViewInit, Attribute, Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { addClass, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';

registerProps();

const DEFAULT_CLS = 'nav app-nav';
const WIDGET_CONFIG = {widgetType: 'wm-nav', hostClass: DEFAULT_CLS};

const NavClassMap =  {
    pills : 'nav-pills',
    tabs : 'nav-tabs',
    navbar : 'navbar-nav'
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

    constructor(
        inj: Injector,
        private route: Router,
        @Attribute('type') type: string,
        @Attribute('layout') layout: string
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.setNavType(type);
        this.setNavLayout(layout);
    }


    private setNavType(type) {
        addClass(this.nativeElement, NavClassMap[type]);
    }

    private setNavLayout(layout) {
        addClass(this.nativeElement, `nav-${layout}`);
    }

    private onNavSelect($event, node, nodeRef) {
        // TODO: need to change this logic
        Array.prototype.forEach.call(nodeRef.parentNode.children, function(node) {
            switchClass(node, '', 'active')
        });
        addClass(nodeRef, 'active');
        this.invokeEventCallback('select', {$event, $item: node});
        this.selecteditem = node;
        if (node) {
            let itemLink   = node[this.itemlink] || node.link;
            let itemAction = node[this.itemaction] || node.action;
            if (itemAction) {
                // TODO: Evaluating the action expression
                /*Utils.evalExp($el.scope(), itemAction).then(function () {
                    if (itemLink) {
                        $window.location.href = itemLink;
                    }
                });*/
            } else if (itemLink) {
                // If action is not present and link is there
                window.location.href = itemLink;
            }
        }
    }

    onPropertyChange(key, nv, ov) {
        super.onPropertyChange(key, nv, ov);
    }

    /**
     * invoked from the menu widget when a menu item is selected.
     * @param e
     * @param $item
     */
    _onMenuItemSelect(e, $item) {
        this.selecteditem = $item;
        this.invokeEventCallback('select', {$event: e, $item});
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }
}
