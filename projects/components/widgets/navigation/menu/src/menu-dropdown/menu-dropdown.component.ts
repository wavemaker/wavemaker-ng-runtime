import { CommonModule } from '@angular/common';
import { MenuDropdownItemComponent } from '../menu-dropdown-item/menu-dropdown-item.component';
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
  standalone: true,
  imports: [CommonModule, MenuDropdownItemComponent],
    selector: 'ul[wmMenuDropdown]',
    templateUrl: './menu-dropdown.component.html'
})
export class MenuDropdownComponent implements AfterViewInit {
    private readonly nativeElement;
    private hasExecutedCallback;
    @Input() items;

    constructor(elRef: ElementRef, private menuRef: MenuComponent) {
        this.nativeElement = elRef.nativeElement;
        this.hasExecutedCallback = false;
        addClass(this.nativeElement, DEFAULT_CLS);
    }

    ngAfterViewInit() {
        const animateItems = this.menuRef.animateitems;
        let animationClass = '';
        if (animateItems) {
            animationClass = `animated ${(animationClasses[animateItems][this.menuRef.menuposition] || animationClasses[animateItems].name)}`;
        }
        addClass(this.nativeElement, `dropdown-menu ${this.menuRef.menualign} ${animationClass}`, true);
       this.getParentWidget();
    }
    // Function to check if the menu widget is present inside other widgets like table, tabs, dialog, nav, list, tile, panel, accordion
    // if true then call createObserver() which internally calculates dropown height
    getParentWidget() {
        const closestWidget  = $(this.menuRef.nativeElement).closest('table, ul.list-group');

        // Check if the closest table is the parent of the menu widget
        if (closestWidget && $(closestWidget).has(this.menuRef.nativeElement).length > 0) {
            this.createObserver(this, this.callback);
        }
    }
    // function which changes the position of the menu dropdown dynamically if it exceeds viewport height
     callback(entries, observer) {
         if (!this.hasExecutedCallback) {
             const self = this;
             const positions = this.menuRef.menuposition?.split(',') || [];
             entries.forEach(entry => {
                 if(entry.isIntersecting) {
                     positions[0]='down';
                     self.menuRef.menuposition= positions.length > 1 ? positions.join() : 'down,right';
                     self.nativeElement.parentElement?.classList.add('dropdown');
                     self.menuRef.setMenuPosition();
                 } else {
                     positions[0]='up';
                     self.menuRef.menuposition = positions.length > 1 ? positions.join() : 'up,right';
                     self.nativeElement.parentElement?.classList.add('dropup');
                     self.menuRef.setMenuPosition();
                     // when container="body" is added to menu dropdown, the dropdown menu ul is attached directly to body.
                     // so adding a class name inorder to adjust the styling of the dropdown
                     const dropdownContainer = self.nativeElement.parentElement?.parentElement;
                     if (dropdownContainer.tagName.toUpperCase() === "BS-DROPDOWN-CONTAINER") {
                         // The parent element is <bs-dropdown-container>
                         self.nativeElement.parentElement?.parentElement?.classList.add('parent-position');
                     }

                 }
             });
             this.hasExecutedCallback = true;
         }
    }

    // function which checks if the dropdown is within the viewport height or exceeds viewport height
    createObserver(target, callback) {
        const options = {
            root: null,
            threshold: 1,
            once: true
        };
        const observer = new IntersectionObserver(callback.bind(this), options);
        observer.observe(target.nativeElement);
    }

}
