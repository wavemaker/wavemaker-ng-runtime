import { Directive, ElementRef } from '@angular/core';

import { addClass } from '@wm/core';
import { PageDirective } from '@wm/components';

declare const $;

@Directive({
    selector: '[wmPage]'
})
export class MobilePageDirective {

    private _$ele;

    constructor(private page: PageDirective, elRef: ElementRef) {
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', () => this._$ele.addClass('has-tabbar'));
    }
}
