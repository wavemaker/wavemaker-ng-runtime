import { AfterContentInit, AfterViewInit, Directive, ElementRef, Injector, OnDestroy } from '@angular/core';

import { SearchComponent } from './search.component';

declare const $;

@Directive({
  standalone: true,
    selector: '[scrollable]'
})
export class ScrollableDirective implements AfterContentInit, AfterViewInit, OnDestroy {
    private elementRef: ElementRef;
    private scrollHandler;

    constructor(inj: Injector, private searchRef: SearchComponent) {
        this.elementRef = inj.get(ElementRef);
    }

    ngAfterContentInit() {
        // add the scroll event listener on the ul element.
        this.scrollHandler = this.notifyParent.bind(this);
        this.elementRef.nativeElement.addEventListener('scroll', this.scrollHandler);
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

    ngOnDestroy() {
        // Remove scroll event listener to prevent memory leak
        if (this.scrollHandler) {
            this.elementRef.nativeElement.removeEventListener('scroll', this.scrollHandler);
        }
    }
}
