import { Directive, ElementRef } from '@angular/core';

import { switchClass } from '@wm/core';

@Directive({
    selector: '[wmSearch]',
    standalone: false
})
export class SearchDirective {

    constructor(elRef: ElementRef) {
        switchClass(elRef.nativeElement, 'app-mobile-search');
    }
}
