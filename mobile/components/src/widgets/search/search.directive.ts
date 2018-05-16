import { Directive, ElementRef, forwardRef, Inject, OnDestroy } from '@angular/core';

import { switchClass } from '@wm/core';

@Directive({
    selector: '[wmSearch]'
})
export class SearchDirective {

    constructor(elRef: ElementRef) {
        switchClass(elRef.nativeElement, 'app-mobile-search', 'app-search');
    }
}
