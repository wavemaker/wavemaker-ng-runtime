import { Attribute, ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { addClass, App, removeClass, triggerItemAction, UserDefinedExecutionContext } from '@wm/core';
import { APPLY_STYLES_TYPE, DatasetAwareNavComponent, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './nav.props';

declare const _;

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
    static initializeProps = registerProps();

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
        private route: Router,
        private userDefinedExecutionContext: UserDefinedExecutionContext,
        private app: App,
        @Attribute('select.event') selectEventCB
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.disableMenuContext = !!selectEventCB;
        this.pageScope = this.viewParent;
        // For selecting the item on load
        const datasetSubscription = this.nodes$.subscribe(() => {
            if (!_.isEmpty(this.nodes)) {
                let itemFound = false;
                const getItem = (nodes, isMenuWidget?) => {
                    _.forEach(nodes, (item) => {
                        if (itemFound) {
                            return;
                        }
                        if (item.isactive) {
                            itemFound = true;
                            this.selecteditem = isMenuWidget ? _.omit(item, ['children', 'value']) : item.value;
                            this.invokeEventCallback('select', {$event: {}, $item: item.value});
                            // Trigger the action associated with active item
                            triggerItemAction(this, item);
                            // _selected is used to add active class for nav item. If we have children inside nav widget then it is not required.
                            if (!isMenuWidget) {
                               item._selected = true;
                            }
                            return false;
                        }
                        if (!_.isEmpty(item.children)) {
                            getItem(item.children, 'menu');
                        }
                    });
                };
                getItem(this.nodes);
            }
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());

    }


    private setNavType(type) {
        addClass(this.nativeElement, NavClassMap[type]);
    }

    private setNavLayout(layout) {
        addClass(this.nativeElement, `nav-${layout}`);
    }

    public onNavSelect($event: Event, item: any, liRef: HTMLElement) {
        $event.preventDefault();

        const selectedItem = _.find(this.nodes, '_selected');
        if (selectedItem) {
            delete selectedItem._selected;
        }

        if (this.activeNavLINode) {
            removeClass(this.activeNavLINode, 'active');
        }

        this.activeNavLINode = liRef;

        addClass(liRef, 'active');

        this.selecteditem = item.value;

        this.invokeEventCallback('select', {$event, $item: item.value});
        // Trigger the action associated with active item
        triggerItemAction(this, item);
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
