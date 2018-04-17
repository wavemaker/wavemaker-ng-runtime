import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, HostListener, Input, Optional, SkipSelf } from '@angular/core';

import { addClass, removeClass } from '@wm/utils';

import { MenuParent } from './menu.component';

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
    templateUrl: './menu-dropdown.component.html',
    providers: [{provide: MenuParent, useExisting: forwardRef(() => MenuDropdownComponent)}]
})
export class MenuDropdownComponent implements MenuParent, AfterViewInit {
    animation;
    _animateClass = '';
    animateitems;
    menuposition;
    _menulayout = '';
    _menualign = '';
    $el;

    @Input()
    set animateClass(nv) {
        removeClass(this.$el, this._animateClass);
        addClass(this.$el, nv);
        this._animateClass = nv;
    }

    get animateClass() {
        return this.parentMenu && this.parentMenu.animateClass;
    }

    @Input()
    set menualign(nv) {
        removeClass(this.$el, this._menualign);
        addClass(this.$el, nv);
        this._menualign = nv;
    }

    get menualign() {
        return this.parentMenu && this.parentMenu.menualign;
    }

    @Input()
    set menulayout(nv) {
        removeClass(this.$el, this._menulayout);
        addClass(this.$el, nv);
        this._menulayout = nv;
    }

    get menulayout() {
        return this.parentMenu && this.parentMenu.menulayout;
    }

    get linktarget() {
        return this.parentMenu && this.parentMenu.linktarget;
    }

    @Input() items;

    constructor(private el: ElementRef, @SkipSelf() @Optional() private parentMenu: MenuParent, public cdr: ChangeDetectorRef) {
        this.$el = el.nativeElement;
        addClass(this.$el, DEFAULT_CLS);
    }

    ngAfterViewInit() {
        this.animation = this.parentMenu.animateitems;
        this.menuposition = this.parentMenu.menuposition;
        if (this.animation) { // If animation is set then add animation class based on menu position, if not set it to default
            this.animateClass = animated + (animationClasses[this.animation][this.menuposition] || animationClasses[this.animation].name);
        } else if (this.items && this.parentMenu.animateClass) {
            // Set same animation to sub menu items of that of the parent.
            this.animateClass = this.parentMenu.animateClass;
        }
    }

    @HostListener('click') onSelect({$event, $scope, item}) {
        const args = {$event, $item: item.value || item.label};
        if ($event) {
            $event.stopPropagation();
        }
        this.parentMenu.onSelect(args);
    }
}
