import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';

import { addClass } from '@wm/core';
import { MenuComponent } from '../menu.component';

const animationClasses = {
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
    private readonly nativeElement;

    @Input() items;

    constructor(elRef: ElementRef, private menuRef: MenuComponent) {
        this.nativeElement = elRef.nativeElement;
        addClass(this.nativeElement, DEFAULT_CLS);
    }

    ngAfterViewInit() {
        const animateItems = this.menuRef.animateitems;
        let animationClass = '';
        if (animateItems) {
            animationClass = `animated ${(animationClasses[animateItems][this.menuRef.menuposition] || animationClasses[animateItems].name)}`;
        }
        addClass(this.nativeElement, `dropdown-menu ${this.menuRef.menualign} ${animationClass}`, true);
    }
}
