import { Component, ElementRef, HostListener, Input, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { $parseEvent, addClass, getRouteNameFromLink, getUrlParams, openLink, UserDefinedExecutionContext } from '@wm/core';

import { MenuComponent } from '../menu.component';
import { isActiveNavItem } from '../../../../utils/widget-utils';
import { NavComponent } from '../../nav/nav.component';

const menuAlignClass = {
    'pull-right' : 'fa-caret-left',
    'dropinline-menu' : 'fa-caret-down',
    'pull-left' : 'fa-caret-right'
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
        private route: Router,
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
            if (isActiveNavItem(this.item.link, this.route.url)) {
                addClass(this.nativeElement, 'active');
            }
        }
    }

    @HostListener('click', ['$event', 'item'])
    onSelect = ($event, item) => {
        if (this.nativeElement !== $event.target.closest('.app-menu-item')) {
            return;
        }
        // prevent event event propagation if auto close is outside click.
        if (this.menuRef.autoclose === 'outsideClick') {
            $event.stopPropagation();
        }

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
        } else if (menuLink) {
            if (menuLink.startsWith('#/')) {
                const queryParams = getUrlParams(menuLink);
                menuLink = getRouteNameFromLink(menuLink);
                this.route.navigate([menuLink], { queryParams});
            } else {
                openLink(menuLink, linkTarget);
            }
        }
    }
}
