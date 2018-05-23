import { AfterContentInit, Directive, ElementRef, Injector } from '@angular/core';
import { SearchComponent } from './search.component';

@Directive({
    selector: '[scrollable]'
})
export class ScrollableDirective implements AfterContentInit {
    private elementRef: ElementRef;

    constructor(inj: Injector, private searchRef: SearchComponent) {
        this.elementRef = inj.get(ElementRef);
    }

    ngAfterContentInit() {
        // add the scroll event listener on the ul element.
        this.elementRef.nativeElement.addEventListener('scroll', this.notifyParent.bind(this));
    }

    private notifyParent(evt: Event) {
        this.searchRef.onScroll(this.elementRef.nativeElement, evt);
    }
}