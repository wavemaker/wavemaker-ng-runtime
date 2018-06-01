import { AfterViewInit, Component, ElementRef, Inject, Input } from '@angular/core';
import { addClass } from '@wm/core';

import { MenuRef } from '../../../framework/types';
import { MenuComponent } from '../menu.component';

declare const $, _;

const animated = 'animated ',
      animationClasses = {
        scale: {
            'name': 'wmScaleInLeft',
            'down,right': 'wmScaleInLeft',
            'down,left': 'wmScaleInRight',
            'up,right': 'wmScaleInTopLeft',
            'up,left': 'wmScaleInTopRight'
        },
        fade: {
            'name': 'fadeIn',
            'down,right': 'fadeIn',
            'down,left': 'fadeIn',
            'up,right': 'fadeIn',
            'up,left': 'fadeIn'
        },
        slide: {
            'name': 'wmSlideInDown',
            'down,right': 'wmSlideInDown',
            'down,left': 'wmSlideInDown',
            'up,right': 'wmSlideInUp',
            'up,left': 'wmSlideInUp'
        }
    };

const DEFAULT_CLS = 'dropdown-menu';

@Component({
    selector: 'ul[wmMenuDropdown]',
    templateUrl: './menu-dropdown.component.html'
})
export class MenuDropdownComponent implements AfterViewInit {
    private _menuAlign;
    private nativeElement;

    @Input()
    set menualign(nv) {
        addClass(this.nativeElement, nv);
        this._menuAlign = nv;
    }

    get menualign() {
        return this._menuAlign;
    }

    @Input() items;

    constructor(private el: ElementRef, @Inject(MenuRef) private parentMenu: MenuComponent) {
        this.nativeElement = el.nativeElement;
        addClass(this.nativeElement, DEFAULT_CLS);
    }

    ngAfterViewInit() {
        const animation = this.parentMenu.animateitems;
        addClass(this.nativeElement, 'dropdown-menu', true);
        if (animation) {
            const menuPosition = this.parentMenu.menuposition;
            // If animation is set then add animation class based on menu position, if not set it to default
            const animationClass = animated + (animationClasses[animation][menuPosition] || animationClasses[animation].name);
            addClass(this.nativeElement, animationClass);
        }
    }
}
