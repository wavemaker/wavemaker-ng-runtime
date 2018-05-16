import { Directive, ElementRef } from '@angular/core';

import { LeftPanelDirective, PageDirective } from '@wm/components';
import { addClass } from '@wm/core';

@Directive({
    selector: '[wmLeftPanel]'
})
export class MobileLeftPanelDirective {

    constructor(private page: PageDirective, private leftPanelRef: LeftPanelDirective, elRef: ElementRef) {
        addClass(elRef.nativeElement, 'wm-mobile-app-left-panel');
        page.notify('wmLeftPanel:ready', leftPanelRef);
    }
}
