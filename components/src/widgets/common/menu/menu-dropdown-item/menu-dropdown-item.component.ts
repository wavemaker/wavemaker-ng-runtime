import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, Input, OnDestroy, Optional, SkipSelf, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { openLink } from '@wm/core';

import { MenuRef } from '../../../framework/types';
import { MenuComponent } from '../menu.component';
import { MenuDropdownComponent } from '../menu-dropdown/menu-dropdown.component';


const isActiveNavItem = (...args) => true;

declare const $, _;

@Component({
    selector: 'li[wmMenuDropdownItem]',
    templateUrl: './menu-dropdown-item.component.html',
})
export class MenuDropdownItemComponent implements AfterViewInit, OnDestroy {

    @Input() item;

    $el;
    menuLink;

    get menulayout () {
        return this.parent && this.parent.menulayout;
    }

    get menualign () {
        return this.parent && this.parent.menualign;
    }

    get linktarget () {
        return this.parent && this.parent.linktarget;
    }

    childMenuDropdownComponent;

    @ViewChild('menuDropdownTemp', {read: ViewContainerRef}) dropdownTemplateRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private vcr: ViewContainerRef,
                private element: ElementRef,
                private route: Router,
                @SkipSelf() @Optional() @Inject(MenuRef) private parent: MenuComponent) {}

    ngOnDestroy() {
        if (this.childMenuDropdownComponent) {
            this.childMenuDropdownComponent.destroy();
        }
    }

    ngAfterViewInit() {
        this.menuLink = this.item[this.parent['itemLink'] || 'link'];
        this.$el = $(this.element.nativeElement);
        if (this.$el.closest('.app-nav-item').length && this.menuLink) {
            if (isActiveNavItem(this.menuLink, this.route.url)) {
                this.$el.addClass('active');
            }
        }
        if (this.item.children && this.item.children.length) {
            const viewRef = this.dropdownTemplateRef;
            viewRef.clear();
            const factory = this.componentFactoryResolver.resolveComponentFactory(MenuDropdownComponent);
            this.childMenuDropdownComponent = viewRef.createComponent(factory);
            const childMenuCmp = this.childMenuDropdownComponent;
            const childMenuCmpIns = childMenuCmp.instance;
            childMenuCmpIns.items = this.item.children;
            childMenuCmpIns.menualign = this.menualign;
            childMenuCmp.changeDetectorRef.detectChanges();
        }
    }

    @HostListener('click', ['$event', 'item']) onSelect = ($event, item) => {
        const args = {$event, item: item.value || item.label};
        const itemAction = args.item[this.parent.itemaction || 'action'],
            linkTarget = this.linktarget;

        // If link starts with # and not with #/ replace with #/
        if (this.menuLink && _.startsWith(this.menuLink, '#') && !_.startsWith(this.menuLink, '#/')) {
            this.menuLink = _.replace(this.menuLink, '#', '#/');
        }

        this.parent.onSelect(args);
        if (itemAction) {
            // TODO: Implement evalExp for the Actions of the menu
           /* evalExp(this.parent, itemAction).then(function () {
                if (this.menuLink) {
                    openLink(this.menuLink, linkTarget);
                }
            });*/
        } else if (this.menuLink) {
            // If action is not present and link is there
            openLink(this.menuLink, linkTarget);
        }
    }
}
