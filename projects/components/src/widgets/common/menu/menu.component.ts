import { AfterViewInit, Attribute, Component, HostListener, Injector, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { Router } from '@angular/router';

import { BsDropdownDirective } from 'ngx-bootstrap';

import { $appDigest, addClass, removeClass, triggerItemAction, UserDefinedExecutionContext  } from '@wm/core';

import { styler } from '../../framework/styler';
import { isActiveNavItem, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './menu.props';
import { DatasetAwareNavComponent, NavNode } from '../base/dataset-aware-nav.component';
import { NavComponent } from '../nav/nav.component';

declare const _;

export const KEYBOARD_MOVEMENTS = {
    MOVE_UP: 'UP-ARROW',
    MOVE_LEFT : 'LEFT-ARROW',
    MOVE_RIGHT : 'RIGHT-ARROW',
    MOVE_DOWN : 'DOWN-ARROW',
    ON_ENTER : 'ENTER',
    ON_TAB : 'TAB',
    ON_ESCAPE : 'ESC'
};

export const MENU_POSITION = {
    UP_LEFT: 'up,left',
    UP_RIGHT: 'up,right',
    DOWN_LEFT: 'down,left',
    DOWN_RIGHT: 'down,right',
    INLINE: 'inline'
};

const POSITION = {
    DOWN_RIGHT: 'down,right',
    DOWN_LEFT: 'down,left',
    UP_RIGHT: 'up,right',
    UP_LEFT: 'up,left',
    INLINE: 'inline'
};
const CARET_CLS = {
    UP: 'fa-caret-up',
    DOWN: 'fa-caret-down'
};
const PULL_CLS = {
    LEFT: 'pull-left',
    RIGHT: 'pull-right'
};

const AUTO_OPEN = {
    NEVER: 'never',
    ACTIVE_PAGE: 'activepage',
    ALWAYS: 'always'
};

const WIDGET_CONFIG = {widgetType: 'wm-menu', hostClass: 'dropdown app-menu'};
@Component({
    selector: '[wmMenu]',
    templateUrl: './menu.component.html',
    providers: [
        provideAsWidgetRef(MenuComponent)
    ]
})
export class MenuComponent extends DatasetAwareNavComponent implements OnInit, OnDestroy, AfterViewInit {
    static initializeProps = registerProps();

    public menualign: string;
    public menuposition: string;
    public menulayout: string;
    public menuclass: string;
    public linktarget: string;
    public iconclass: string;
    public animateitems: string;
    public disableMenuContext: boolean;
    public autoclose: string;
    public autoopen: string;

    private itemActionFn: Function;
    private menuCaret = 'fa-caret-down';
    private _selectFirstItem = false;

    public type: any;

    @HostListener('onShown') onShow() {
        if (this._selectFirstItem) {
            setTimeout(() => {
                this.$element.find('> ul[wmmenudropdown] li.app-menu-item:first > a').focus();
            });
        }
        $appDigest();
    }
    @HostListener('onHidden') onHide () {
        this.$element.find('>.dropdown-toggle').focus();
        this.$element.find('li').removeClass('open');
        this._selectFirstItem = false;
        $appDigest();
    }

    @HostListener('keydown.arrowup', ['$event', '"UP-ARROW"'])
    @HostListener('keydown.arrowdown', ['$event', '"DOWN-ARROW"'])
    @HostListener('keydown.arrowright', ['$event', '"RIGHT-ARROW"'])
    @HostListener('keydown.arrowleft', ['$event', '"LEFT-ARROW"'])
    @HostListener('keydown.enter', ['$event', '"ENTER"']) onKeyDown($event, eventAction) {
        const KEY_MOVEMENTS = _.clone(KEYBOARD_MOVEMENTS);
        if (this.menuposition === MENU_POSITION.UP_RIGHT) {
            KEY_MOVEMENTS.MOVE_UP = 'DOWN-ARROW';
            KEY_MOVEMENTS.MOVE_DOWN = 'UP-ARROW';
        } else if (this.menuposition === MENU_POSITION.UP_LEFT) {
            KEY_MOVEMENTS.MOVE_UP = 'DOWN-ARROW';
            KEY_MOVEMENTS.MOVE_DOWN = 'UP-ARROW';
            KEY_MOVEMENTS.MOVE_LEFT = 'RIGHT-ARROW';
            KEY_MOVEMENTS.MOVE_RIGHT = 'LEFT-ARROW';
        } else if (this.menuposition === MENU_POSITION.DOWN_LEFT) {
            KEY_MOVEMENTS.MOVE_LEFT = 'RIGHT-ARROW';
            KEY_MOVEMENTS.MOVE_RIGHT = 'LEFT-ARROW';
        }

        if (_.includes([KEY_MOVEMENTS.MOVE_DOWN, KEY_MOVEMENTS.MOVE_RIGHT], eventAction)) {
            if (!this.bsDropdown.isOpen) {
                this._selectFirstItem = true;
                this.bsDropdown.show();
            } else {
                this.$element.find('> ul[wmmenudropdown] li.app-menu-item:first > a').focus();
            }
        } else if (eventAction === KEY_MOVEMENTS.ON_ENTER) {
            this.bsDropdown.toggle(true);
        } else if (_.includes([KEY_MOVEMENTS.MOVE_UP, KEY_MOVEMENTS.MOVE_LEFT], eventAction)) {
            this.bsDropdown.hide();
        }
        $event.preventDefault();
    }

    constructor(
        inj: Injector,
        public route: Router,
        private userDefinedExecutionContext: UserDefinedExecutionContext,
        @Self() @Optional() public bsDropdown: BsDropdownDirective,
        @Optional() private parentNav: NavComponent,
        @Attribute('select.event') public selectEventCB: string
    ) {
        super(inj, WIDGET_CONFIG);
        if (parentNav) {
            this.disableMenuContext = !!parentNav.disableMenuContext;
        } else {
            this.disableMenuContext = !!selectEventCB;
        }
        // For selecting the item on load
        const datasetSubscription = this.nodes$.subscribe(() => {
            if (!_.isEmpty(this.nodes)) {
                // If menu widget is inside nav widget then dont check for item isactive property because these will be handled form nav widget.
                if (this.parentNav) {
                   return;
                }
                let itemFound = false;
                const getItem = (nodes) => {
                     _.forEach(nodes, (item) => {
                         if (itemFound) {
                             return;
                         }
                        if (item.isactive) {
                            itemFound = true;
                            this.onMenuItemSelect({$event: {}, $item: item});
                            // Trigger the action associated with active item
                            triggerItemAction(this, item);
                            return false;
                        }
                        if (!_.isEmpty(item.children)) {
                            getItem(item.children);
                        }

                    });
                };
                getItem(this.nodes);
            }
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());

    }

    /**
     * returns true if the menu has link to the current page.
     * @param nodes
     */
    private hasLinkToCurrentPage(nodes: Array<NavNode>) {
        return nodes.some(node => {
            if (isActiveNavItem(node.link, this.route.url)) {
                return true;
            }
            if (node.children) {
                return this.hasLinkToCurrentPage(node.children);
            }
        });
    }

    protected resetNodes() {
        super.resetNodes();
        // open the menu if any of its menu items has link to current page and if autoopen value is 'active page'
        if ((this.autoopen === AUTO_OPEN.ACTIVE_PAGE && this.hasLinkToCurrentPage(this.nodes)) || this.autoopen === AUTO_OPEN.ALWAYS) {
            this.bsDropdown.show();
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.setMenuPosition();
    }

    onPropertyChange(key: string, nv: any, ov?: any) {

        if (key === 'tabindex') {
            return;
        }

        if (key === 'autoclose') {
            this.bsDropdown.autoClose = nv !== 'disabled';
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    private setMenuPosition() {
        switch (this.menuposition) {
            case POSITION.DOWN_RIGHT:
                removeClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.LEFT;
                this.menuCaret = CARET_CLS.DOWN;
                break;
            case POSITION.DOWN_LEFT:
                removeClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.RIGHT;
                this.menuCaret = CARET_CLS.DOWN;
                break;
            case POSITION.UP_LEFT:
                addClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.RIGHT;
                this.menuCaret = CARET_CLS.UP;
                break;
            case POSITION.UP_RIGHT:
                addClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.LEFT;
                this.menuCaret = CARET_CLS.UP;
                break;
            case POSITION.INLINE:
                this.menualign = 'dropinline-menu';
                break;
        }
    }

    public onMenuItemSelect(args) {
        const {$event} = args;
        const $item = args.$item.value;
        this.invokeEventCallback('select', {$event, $item});
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('.dropdown-toggle') as HTMLElement, this);
    }
}
