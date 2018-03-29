import { Component, Input, ElementRef, ViewContainerRef, SkipSelf, Optional, ComponentFactoryResolver, forwardRef, AfterViewInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuComponent, MenuParent } from './menu.component';
import { MenuDropdownComponent } from './menu-dropdown.component';

const openLink = (link: string, target: string) => {
    if (/*hasCordova && */_.startsWith(link, '#')) {
        location.hash = link;
    } else {
        window.open(link, target);
    }
};

const isActiveNavItem = (...args) => true;

declare const $, _;

@Component({
    selector: 'li[wmMenuDropdownItem]',
    templateUrl: './menu-dropdown-item.component.html',
    providers: [{provide: MenuParent, useExisting: forwardRef(() => MenuComponent)}]
})
export class MenuDropdownItemComponent implements MenuParent, AfterViewInit, OnDestroy {

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
                @SkipSelf() @Optional() private parent: MenuParent) {}

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
            childMenuCmpIns.menulayout = this.menulayout;
            childMenuCmpIns.menualign = this.menualign;
            childMenuCmp.changeDetectorRef.detectChanges();
        }
    }

    @HostListener('click', ['$event', 'item']) onSelect = ($event, item) => {
        const args = {$event, item: item.value || item.label};
        const itemAction = args.item[this.parent.itemaction || 'action'],
            linkTarget = this.linktarget || '_self';

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
