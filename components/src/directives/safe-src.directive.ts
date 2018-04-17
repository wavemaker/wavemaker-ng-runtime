import { Directive, ElementRef, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { setProperty } from '@wm/utils';

@Directive({
    selector: '[safeSrc]'
})
export class SafeSrcDirective {
    @Input() safeSrc;
    set(resourceUrl) {
        setProperty(this.el.nativeElement, 'src', this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, resourceUrl));
    }

    constructor(private domSanitizer: DomSanitizer, private el: ElementRef) {}
}