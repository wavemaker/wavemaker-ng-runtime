import { Directive, ElementRef, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { setHtml } from '@wm/utils';

@Directive({
    selector: '[safeHtml]'
})
export class SafeHtmlDirective {
    @Input()
    set safeHtml(html) {
        setHtml(this.el.nativeElement, this.domSanitizer.sanitize(SecurityContext.HTML, html));
    }

    constructor(private domSanitizer: DomSanitizer, private el: ElementRef) {}
}