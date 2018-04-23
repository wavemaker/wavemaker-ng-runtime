import { Directive, ElementRef, Input } from '@angular/core';

import { setHtml } from '@wm/core';

import { SANITIZE_AS, SanitizePipe } from '../pipes/sanitize.pipe';

@Directive({
    selector: '[safeHtml]'
})
export class SafeHtmlDirective {
    @Input()
    set safeHtml(html) {
        setHtml(this.el.nativeElement, this.sanitize.transform(html, SANITIZE_AS.HTML));
    }

    constructor(private sanitize: SanitizePipe, private el: ElementRef) {}
}