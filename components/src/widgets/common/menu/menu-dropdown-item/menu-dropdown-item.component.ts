import { Component, ElementRef, HostListener, Input, OnInit, Optional } from '@angular/core';

import { $parseEvent, addClass, getRouteNameFromLink, getUrlParams, openLink, UserDefinedExecutionContext } from '@wm/core';

import { KEYBOARD_MOVEMENTS, MENU_POSITION, MenuComponent } from '../menu.component';
import { isActiveNavItem } from '../../../../utils/widget-utils';
import { NavComponent } from '../../nav/nav.component';

declare const _, $;

const menuAlignClass = {
    'pull-right' : 'fa-caret-left',
    'dropinline-menu' : 'fa-caret-down',
    'pull-left' : 'fa-caret-right'
};

const MENU_LAYOUT_TYPE = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

@Component({
    selector: 'li[wmMenuDropdownItem]',
    templateUrl: './menu-dropdown-item.component.html',
})
export class MenuDropdownItemComponent implements OnInit {

    public menualign: string;

    private itemActionFn: Function;

    @Input() item;

    private readonly nativeElement;

    constructor(
        private menuRef: MenuComponent,
        private userDefinedExecutionContext: UserDefinedExecutionContext,
        @Optional() private parentNav: NavComponent,
        elRef: ElementRef,
    ) {
        this.nativeElement = elRef.nativeElement;
        addClass(this.nativeElement, 'app-menu-item');

        this.menualign = menuAlignClass[this.menuRef.menualign] || menuAlignClass['pull-left'];
    }

    ngOnInit() {
        // add active class to the item only if it is in nav component.
        if (this.parentNav) {
            if (isActiveNavItem(this.item.link, this.menuRef.route.url)) {
                addClass(this.nativeElement, 'active');
                $(this.nativeElement).parentsUntil(this.menuRef.$element, '.dropdown-submenu').addClass('open');
            }
        }
    }

    getInitialKeyMovements() {
        const KEY_MOVEMENTS = _.clone(KEYBOARD_MOVEMENTS);
        if (this.menuRef.menulayout === MENU_LAYOUT_TYPE.HORIZONTAL) {
            KEY_MOVEMENTS.MOVE_UP = 'LEFT-ARROW';
            KEY_MOVEMENTS.MOVE_LEFT = 'UP-ARROW';
            KEY_MOVEMENTS.MOVE_RIGHT = 'DOWN-ARROW';
            KEY_MOVEMENTS.MOVE_DOWN = 'RIGHT-ARROW';
        } else {
            if (this.menuRef.menuposition === MENU_POSITION.DOWN_LEFT || this.menuRef.menuposition === MENU_POSITION.UP_LEFT) {
                KEY_MOVEMENTS.MOVE_LEFT = 'RIGHT-ARROW';
                KEY_MOVEMENTS.MOVE_RIGHT = 'LEFT-ARROW';
            } else if (this.menuRef.menuposition === 'inline') {
                KEY_MOVEMENTS.MOVE_UP = 'LEFT-ARROW';
                KEY_MOVEMENTS.MOVE_LEFT = 'UP-ARROW';
                KEY_MOVEMENTS.MOVE_RIGHT = 'DOWN-ARROW';
                KEY_MOVEMENTS.MOVE_DOWN = 'RIGHT-ARROW';
            }
        }
        return KEY_MOVEMENTS;
    }

    @HostListener('keydown.escape', ['$event', '"ESC"'])
    @HostListener('keydown.enter', ['$event', '"ENTER"'])
    @HostListener('keydown.arrowup', ['$event', '"UP-ARROW"'])
    @HostListener('keydown.arrowdown', ['$event', '"DOWN-ARROW"'])
    @HostListener('keydown.arrowright', ['$event', '"RIGHT-ARROW"'])
    @HostListener('keydown.arrowleft', ['$event', '"LEFT-ARROW"']) onKeyDown($event, eventAction) {
        const $li = $(this.nativeElement);
        const $ul = $(this.nativeElement).closest('ul.dropdown-menu');
        const $parentUl = this.menuRef.$element.find('> ul.dropdown-menu');
        const ARROW_KEYS = ['LEFT-ARROW', 'RIGHT-ARROW', 'UP-ARROW', 'DOWN-ARROW'];
        const KEY_MOVEMENTS = this.getInitialKeyMovements();

        if (_.includes(ARROW_KEYS, eventAction)) {
            // preventing from page scroll when up/down arrow is pressed, in case of menu is opened.
            $event.preventDefault();
        }
        if ((eventAction === KEY_MOVEMENTS.ON_ENTER && !this.item.link) || eventAction === KEY_MOVEMENTS.MOVE_RIGHT) {
            // when there is no link for the menu, on enter open the inner child elements and focus the first $element
            $event.stopPropagation();
            if (this.item.children.length > 1) {
                $li.toggleClass('open');
                $li.find('li:first > a').focus();
            } else {
                $li.find('> a').focus();
            }
        } else if (eventAction === KEY_MOVEMENTS.MOVE_LEFT) {
            if ($parentUl[0] !== $ul[0]) {
                const $parentItem = $ul.parent();
                $parentItem.toggleClass('open').find('li.open').removeClass('open');
                $parentItem.find('> a').focus();
                $event.stopPropagation();
            }
        } else if (eventAction === KEY_MOVEMENTS.MOVE_UP) {
            if ($parentUl[0] !== $ul[0] || $parentUl.find('> li:first')[0] !== this.nativeElement) {
                $event.stopPropagation();
                $li.prev().find('> a').focus();
            }
        } else if (eventAction === KEY_MOVEMENTS.MOVE_DOWN) {
            $event.stopPropagation();
            if ($parentUl.find('> li:last')[0] === this.nativeElement && (this.menuRef.menulayout !== MENU_LAYOUT_TYPE.HORIZONTAL && this.menuRef.menuposition === MENU_POSITION.UP_RIGHT || this.menuRef.menuposition === MENU_POSITION.UP_LEFT)) {
                this.menuRef.bsDropdown.hide();
            } else {
                $li.next().find('> a').focus();
            }
        } else if ((eventAction === KEY_MOVEMENTS.ON_TAB && $parentUl.children().last()[0] === this.nativeElement) || eventAction === KEY_MOVEMENTS.ON_ESCAPE) {
            /*closing all the children elements when
            * 1. Tab is clicked on the last $element
            * 2. When Escape key is clicked*/
            $event.preventDefault();
            this.menuRef.bsDropdown.hide();
        } else if (eventAction === KEY_MOVEMENTS.ON_ENTER) {
            this.onSelect($event, this.item);
        }
    }

    @HostListener('click', ['$event', 'item'])
    onSelect = ($event, item) => {
        if (this.nativeElement !== $($event.target).closest('.app-menu-item').get(0)) {
            return;
        }
        // prevent event event propagation if auto close is outside click.
        if (this.menuRef.autoclose === 'outsideClick') {
            $event.stopPropagation();
        }

        $event.preventDefault();
        const args = {$event, $item: item};
        const linkTarget = this.menuRef.linktarget;
        const itemAction = item.action;

        let menuLink = item.link;

        this.menuRef.onMenuItemSelect(args);

        if (itemAction) {
            if (!this.itemActionFn) {
                this.itemActionFn = $parseEvent(itemAction);
            }

            this.itemActionFn(this.userDefinedExecutionContext, Object.create(item));
        }
        if (menuLink) {
            if (menuLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
                const queryParams = getUrlParams(menuLink);
                menuLink = getRouteNameFromLink(menuLink);
                this.menuRef.route.navigate([menuLink], { queryParams});
            } else {
                openLink(menuLink, linkTarget);
            }
        }
    }
}
