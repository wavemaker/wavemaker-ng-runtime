import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { ButtonComponent } from '@wm/components/input';
import { MenuDropdownComponent } from './menu-dropdown/menu-dropdown.component';
import {
    AfterViewInit,
    Attribute,
    Component,
    HostListener,
    Inject,
    Injector,
    OnDestroy,
    OnInit,
    Optional,
    Self
} from '@angular/core';
import {Router} from '@angular/router';

import {BsDropdownDirective, BsDropdownModule} from 'ngx-bootstrap/dropdown';

import {
    $appDigest,
    addClass,
    App,
    removeClass,
    toggleClass,
    triggerItemAction,
    UserDefinedExecutionContext
} from '@wm/core';
import {
    AUTOCLOSE_TYPE,
    DatasetAwareNavComponent,
    hasLinkToCurrentPage,
    provideAsWidgetRef,
    styler
} from '@wm/components/base';
import {NavComponent} from './nav/nav.component';

import {registerProps} from './menu.props';
import {clone, forEach, includes, isEmpty} from "lodash-es";
import { AnchorComponent } from '@wm/components/basic';

export const KEYBOARD_MOVEMENTS = {
    MOVE_UP: 'UP-ARROW',
    MOVE_LEFT: 'LEFT-ARROW',
    MOVE_RIGHT: 'RIGHT-ARROW',
    MOVE_DOWN: 'DOWN-ARROW',
    ON_ENTER: 'ENTER',
    ON_MOUSE_ENTER: 'MOUSE-ENTER',
    ON_MOUSE_LEAVE: 'MOUSE-LEAVE',
    ON_TAB: 'TAB',
    ON_SHIFT_TAB: 'SHIFT-TAB',
    ON_ESCAPE: 'ESC'
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

const WIDGET_CONFIG = { widgetType: 'wm-menu', hostClass: 'dropdown app-menu' };
@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule, AnchorComponent, ButtonComponent, MenuDropdownComponent, BsDropdownModule],
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
    public showonhover: boolean;
    public autoclose: string;
    public autoopen: string;
    public hint: string;
    public arialabel: string;

    private itemActionFn: Function;
    private menuCaret = 'fa-caret-down';
    private _selectFirstItem = false;

    public type: any;
    public _menuposition: string;

    @HostListener('onShown') onShow() {
        this._menuposition = this.menuposition;
        if (this._selectFirstItem) {
            setTimeout(() => {
                this.$element.find('> ul[wmmenudropdown] li.app-menu-item').first().find('> a').focus();
            });
        }
        $appDigest();
    }
    @HostListener('onHidden') onHide() {
        this.$element.find('li').removeClass('open');
        this._selectFirstItem = false;
        // reset the menuposition when dropdown is closed
        this.menuposition = this._menuposition ? this._menuposition : MENU_POSITION.DOWN_RIGHT;
        this.setMenuPosition();
        $appDigest();
    }

    @HostListener('keydown.arrowup', ['$event', '"UP-ARROW"'])
    @HostListener('mouseenter', ['$event', '"MOUSE-ENTER"'])
    @HostListener('mouseleave', ['$event', '"MOUSE-LEAVE"'])
    @HostListener('keydown.arrowdown', ['$event', '"DOWN-ARROW"'])
    @HostListener('keydown.arrowright', ['$event', '"RIGHT-ARROW"'])
    @HostListener('keydown.arrowleft', ['$event', '"LEFT-ARROW"'])
    @HostListener('keydown.enter', ['$event', '"ENTER"']) onKeyDown($event, eventAction) {
        const KEY_MOVEMENTS = clone(KEYBOARD_MOVEMENTS);
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

        if (includes([KEY_MOVEMENTS.MOVE_DOWN, KEY_MOVEMENTS.MOVE_RIGHT], eventAction)) {
            if (!this.bsDropdown.isOpen) {
                this._selectFirstItem = true;
                this.bsDropdown.show();
            } else {
                this.$element.find('> ul[wmmenudropdown] li.app-menu-item').first().find('> a').focus();
            }
        } else if (eventAction === KEY_MOVEMENTS.ON_ENTER || (eventAction === KEY_MOVEMENTS.ON_MOUSE_ENTER && this.showonhover)) {
            this.bsDropdown.toggle(true);
        } else if (includes([KEY_MOVEMENTS.MOVE_UP, KEY_MOVEMENTS.MOVE_LEFT], eventAction) || (eventAction == KEY_MOVEMENTS.ON_MOUSE_LEAVE && this.autoclose == AUTOCLOSE_TYPE.ALWAYS && this.showonhover)) {
            this.bsDropdown.hide();
        }
        $event.preventDefault();
    }

    constructor(
        inj: Injector,
        public route: Router,
        private userDefinedExecutionContext: UserDefinedExecutionContext,
        private app: App,
        @Self() @Optional() public bsDropdown: BsDropdownDirective,
        @Optional() private parentNav: NavComponent,
        @Attribute('select.event') public selectEventCB: string,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);
        if (parentNav) {
            this.disableMenuContext = !!parentNav.disableMenuContext;
        } else {
            this.disableMenuContext = !!selectEventCB;
        }
        // For selecting the item on load
        const datasetSubscription = this.nodes$.subscribe(() => {
            if (!isEmpty(this.nodes)) {
                if (hasLinkToCurrentPage(this.nodes, this.route.url)) {
                    addClass(this.nativeElement.querySelector('.dropdown-toggle') as HTMLElement, 'active');
                }
                // If menu widget is inside nav widget then dont check for item isactive property because these will be handled form nav widget.
                if (this.parentNav) {
                    return;
                }
                let itemFound = false;
                const getItem = (nodes) => {
                    forEach(nodes, (item) => {
                        if (itemFound) {
                            return;
                        }
                        if (item.isactive) {
                            itemFound = true;
                            this.onMenuItemSelect({ $event: {}, $item: item });
                            // Trigger the action associated with active item
                            triggerItemAction(this, item);
                            return false;
                        }
                        if (!isEmpty(item.children)) {
                            getItem(item.children);
                        }

                    });
                };
                getItem(this.nodes);
            }
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());

    }

    protected resetNodes() {
        super.resetNodes();
        // open the menu if any of its menu items has link to current page and if autoopen value is 'active page'
        if ((this.autoopen === AUTO_OPEN.ACTIVE_PAGE && hasLinkToCurrentPage(this.nodes, this.route.url)) || this.autoopen === AUTO_OPEN.ALWAYS) {
            this.bsDropdown.show();
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.setMenuPosition();

        const cancelSubscription = this.app.subscribe("highlightActiveLink", (data) => {
            toggleClass(this.nativeElement.querySelector('.dropdown-toggle') as HTMLElement, 'active', hasLinkToCurrentPage(this.nodes, this.route.url ));
        });
        this.registerDestroyListener(() => cancelSubscription());
    }

    onPropertyChange(key: string, nv: any, ov?: any) {

        if (key === 'tabindex') {
            return;
        }

        if (key === 'autoclose') {
            this.bsDropdown.autoClose = nv !== AUTOCLOSE_TYPE.DISABLED;
            this.autoclose = nv;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public setMenuPosition() {
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
        const { $event } = args;
        const $item = args.$item.value;
        this.invokeEventCallback('select', { $event, $item });
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('.dropdown-toggle') as HTMLElement, this);
    }
}
