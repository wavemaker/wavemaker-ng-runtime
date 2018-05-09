import { Directive, ElementRef, Input } from '@angular/core';
import { setAttr } from '@wm/core';

@Directive({
    selector: '[wmAutocomplete]'
})
export class WmAutocompleteDirective {

    @Input('wmAutocomplete')
    set wmAutocomplete(val) {
        if (val) {
            setAttr(this.elRef.nativeElement, 'autocomplete', 'on');
        } else {
            setAttr(this.elRef.nativeElement, 'autocomplete', 'off');
        }
    }

    constructor(public  elRef: ElementRef) {}
}