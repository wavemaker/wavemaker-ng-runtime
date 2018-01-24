import { Directive, ElementRef } from '@angular/core';
import { addClass, toggleClass } from '@utils/dom';

const DEFAULT_CLS = 'app-panel-footer panel-footer clearfix';

@Directive({
    selector: '[wmPanelFooter]'
})
export class PanelFooterDirective {

    _expanded: boolean = true;
    $element;

    constructor(elRef: ElementRef) {
        this.$element = elRef.nativeElement;
        addClass(this.$element, DEFAULT_CLS);
    }

    set expanded(newVal) {
        this._expanded = newVal;
        toggleClass(this.$element, 'ng-hide', !newVal);
    }

    get expanded() {
        return this._expanded;
    }
}
