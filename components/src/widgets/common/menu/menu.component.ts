import { AfterViewInit, Attribute, Component, HostListener, Injector, OnDestroy, OnInit, Optional, Self } from '@angular/core';

import { BsDropdownDirective } from 'ngx-bootstrap';

import { $appDigest, addClass, removeClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './menu.props';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
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

registerProps();

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

const WIDGET_CONFIG = {widgetType: 'wm-menu', hostClass: 'dropdown app-menu'};
@Component({
    selector: '[wmMenu]',
    templateUrl: './menu.component.html',
    providers: [
        provideAsWidgetRef(MenuComponent)
    ]
})
export class MenuComponent extends DatasetAwareNavComponent implements OnInit, OnDestroy, AfterViewInit {

    public menualign: string;
    public menuposition: string;
    public menulayout: string;
    public menuclass: string;
    public linktarget: string;
    public iconclass: string;
    public animateitems: string;
    public disableMenuContext: boolean;
    public autoclose: string;

    private menuCaret: string = 'fa-caret-down';
    private _selectFirstItem = false;

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

        if (eventAction === KEY_MOVEMENTS.MOVE_DOWN || eventAction === KEY_MOVEMENTS.MOVE_RIGHT || eventAction === KEY_MOVEMENTS.ON_ENTER) {
            this._selectFirstItem = true;
            this.bsDropdown.show();
            $event.preventDefault();
        } else if (eventAction === KEY_MOVEMENTS.MOVE_UP || eventAction === KEY_MOVEMENTS.MOVE_LEFT) {
            this.bsDropdown.hide();
            $event.preventDefault();
        }
    }

    constructor(
        inj: Injector,
        @Self() @Optional() public bsDropdown: BsDropdownDirective,
        @Optional() parentNav: NavComponent,
        @Attribute('select.event') public selectEventCB: string
    ) {
        super(inj, WIDGET_CONFIG);
        if (parentNav) {
            this.disableMenuContext = !!parentNav.disableMenuContext;
        } else {
            this.disableMenuContext = !!selectEventCB;
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
        args.$item = _.omit(args.$item, ['children', 'value']);
        this.invokeEventCallback('select', args);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('.dropdown-toggle') as HTMLElement, this);
    }
}
