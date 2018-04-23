import { Directive, ElementRef, Input } from '@angular/core';

import { setProperty } from '@wm/core';
import { SANITIZE_AS, SanitizePipe } from '../pipes/sanitize.pipe';

@Directive({
    selector: '[safeSrc]'
})
export class SafeSrcDirective {
    @Input() safeSrc;
    set(resourceUrl) {
        setProperty(this.el.nativeElement, 'src', this.sanitize.transform(resourceUrl, SANITIZE_AS.HTML));
    }

    constructor(private sanitize: SanitizePipe, private el: ElementRef) {}
}