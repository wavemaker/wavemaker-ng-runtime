import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  standalone: true,
    selector: '[textContent]'
})
export class TextContentDirective {
    @Input()
    set textContent(nv) {
        let v = nv;

        if (nv === undefined || nv === null) {
            v = '';
        }
        this.elRef.nativeElement.textContent = v;
    }

    constructor(private elRef: ElementRef) {}
}
