import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, ElementRef, HostListener, Inject, Input, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import {addClass, evalExp, getRouteFromNavLink, getUrlParams, openLink} from '@wm/core';

import { MenuRef } from '../../../framework/types';
import { MenuComponent } from '../menu.component';
import { MenuDropdownComponent } from '../menu-dropdown/menu-dropdown.component';
import { isActiveNavItem} from '../../../../utils/widget-utils';

declare const $, _;

@Component({
    selector: 'li[wmMenuDropdownItem]',
    templateUrl: './menu-dropdown-item.component.html',
})
export class MenuDropdownItemComponent implements AfterViewInit, OnDestroy {
    @Input() item;
    @Input() menualign;

    private nativeElement;
    private dropdownCompRef: ComponentRef<MenuDropdownComponent>;

    @ViewChild('menuDropdownContainer', {read: ViewContainerRef}) dropDownContainer;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private vcr: ViewContainerRef,
        private element: ElementRef,
        private route: Router,
        @Inject(MenuRef) private parent: MenuComponent
    ) {
        this.nativeElement = this.element.nativeElement;
    }

    ngOnDestroy() {
        if (this.dropdownCompRef) {
            this.dropdownCompRef.destroy();
        }
    }

    private createDropDown(): ComponentRef<MenuDropdownComponent> {
        this.dropDownContainer.clear();
        const factory = this.componentFactoryResolver.resolveComponentFactory(MenuDropdownComponent);
        return this.dropDownContainer.createComponent(factory);
    }

    ngAfterViewInit() {
        // add active class to the item only if it is in nav component.
        if (this.nativeElement.closest('.app-nav-item')) {
            if (isActiveNavItem(this.item.link, this.route.url)) {
                addClass(this.nativeElement, 'active');
            }
        }
        if (this.item.children.length) {
            this.dropdownCompRef = this.createDropDown();

            const childDropdown: MenuDropdownComponent = this.dropdownCompRef.instance;
            childDropdown.items = this.item.children;
            childDropdown.menualign = this.parent.menualign;
            this.dropdownCompRef.changeDetectorRef.detectChanges();
        }
    }

    @HostListener('click', ['$event', 'item'])
    onSelect = ($event, item) => {
        if (this.element.nativeElement !== $event.target.closest('[wmmenudropdownitem]')) {
            return;
        }
        // prevent event event propagation if auto close is outside click.
        if (this.parent.autoclose === 'outsideClick') {
            $event.stopPropagation();
        }
        const args = {$event, $item: item};
        const linkTarget = this.parent.linktarget;
        const itemAction = item.action;
        let menuLink = item.link;
        this.parent.onSelect(args);
        if (itemAction) {
            // evalExp(itemAction, item, (this.parent.inj as any).view.context);
        } else if (menuLink) {
            if (menuLink.startsWith('#/')) {
                const queryParams = getUrlParams(menuLink);
                menuLink = getRouteFromNavLink(menuLink);
                this.route.navigate([menuLink], { queryParams});
            } else {
                openLink(menuLink, linkTarget);
            }
        }
    }
}
