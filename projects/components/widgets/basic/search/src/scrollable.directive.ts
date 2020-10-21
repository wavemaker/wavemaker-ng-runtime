import { AfterContentInit, AfterViewInit, Directive, ElementRef, Injector } from '@angular/core';

import { SearchComponent } from './search.component';

declare const $;

@Directive({
    selector: '[scrollable]'
})
export class ScrollableDirective implements AfterContentInit, AfterViewInit {
    private elementRef: ElementRef;

    constructor(inj: Injector, private searchRef: SearchComponent) {
        this.elementRef = inj.get(ElementRef);
    }

    ngAfterContentInit() {
        // add the scroll event listener on the ul element.
        this.elementRef.nativeElement.addEventListener('scroll', this.notifyParent.bind(this));
        this.searchRef.dropdownEl = $(this.elementRef.nativeElement);
        (this.searchRef as any).onDropdownOpen();
    }

    ngAfterViewInit() {
        if (!this.searchRef.isMobileAutoComplete()) {
            // assigning width for the dropdown.
            const typeAheadInput = this.searchRef.$element.find('input').first();
            this.searchRef.dropdownEl.width(typeAheadInput.outerWidth());
        }
    }

    private notifyParent(evt: Event) {
        this.searchRef.onScroll(this.elementRef.nativeElement, evt);
    }
}
