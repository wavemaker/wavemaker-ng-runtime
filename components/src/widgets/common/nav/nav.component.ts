import { AfterViewInit, Component, ViewChildren, Injector, OnInit, QueryList } from '@angular/core';

import { addClass, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
import { MenuComponent } from '../menu/menu.component';

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
    public type;
    public layout;
    public autoclose;
    public isOpen;

    private menuSubscribers = [];

    // to query all the menu components in the view.
    @ViewChildren(MenuComponent) menus: QueryList<MenuComponent>;

    constructor(
        inj: Injector
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
        Array.prototype.forEach.call(nodeRef.parentNode.children, function(childNode) {
            switchClass(childNode, '', 'active');
        });
        addClass(nodeRef, 'active');
        this.invokeEventCallback('select', {$event, $item: node});
        this.selecteditem = node;
        if (node) {
            const itemLink: string   = node[this.itemlink] || node.link;
            const itemAction: string = node[this.itemaction] || node.action;
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

    ngOnInit() {
        super.ngOnInit();
        this.setNavType(this.type);
        this.setNavLayout(this.layout);
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
        // subscribe to the menuItemSelect event on the menu.
        this.menus.changes.subscribe((menus) => {
            // menu subscribes list.
            this.menuSubscribers.forEach((subscriber) => subscriber.unsubscribe());
            this.menuSubscribers.length = 0;
            menus.forEach( (menu) => {
                this.menuSubscribers.push(menu.select.asObservable().subscribe((e: any) => {
                    this._onMenuItemSelect(e.$event, e.$item);
                }));
            });
        });
    }
}
