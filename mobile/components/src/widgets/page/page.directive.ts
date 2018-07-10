import { Directive, ElementRef } from '@angular/core';

import { PageDirective } from '@wm/components';
import { addClass } from '@wm/core';

declare const $;

@Directive({
    selector: '[wmPage]'
})
export class MobilePageDirective {

    private _$ele;

    public showLoader = true;

    constructor(private page: PageDirective, elRef: ElementRef) {
        addClass(elRef.nativeElement, 'mobile-app-page');
        this._$ele = $(elRef.nativeElement);
        page.subscribe('wmMobileTabbar:ready', () => this._$ele.addClass('has-tabbar'));
    }

}
