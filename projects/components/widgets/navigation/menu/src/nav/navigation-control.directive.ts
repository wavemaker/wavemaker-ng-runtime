import { Directive, ElementRef, Input } from '@angular/core';

import { setAttr } from '@wm/core';

export const disableContextMenu = ($event: Event) => {
    $event.preventDefault();
};

@Directive({selector: '[wmNavigationControl]'})
export class NavigationControlDirective {

    private nativeElement: HTMLElement;
    private _link: string;

    @Input() disableMenuContext: boolean;

    @Input() set wmNavigationControl(val) {
        this._link = val;
        if (val && !this.disableMenuContext) {
            setAttr(this.nativeElement, 'href', val);
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
        } else {
            setAttr(this.nativeElement, 'href', 'javascript:void(0)');
            this.nativeElement.addEventListener('contextmenu', disableContextMenu);
        }
    }

    constructor(eleRef: ElementRef) {
        this.nativeElement = eleRef.nativeElement;
    }
}
