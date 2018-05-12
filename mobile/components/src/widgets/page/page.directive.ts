import { AfterContentInit, Directive, ElementRef, forwardRef, Inject, OnDestroy } from '@angular/core';

import { LeftPanelDirective, PageDirective } from '@wm/components';
import { addClass } from '@wm/core';

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
