import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';

import { setAttr } from '@wm/core';

export const disableContextMenu = ($event: Event) => {
    $event.preventDefault();
};

@Directive({
    standalone: true,
    selector: '[wmNavigationControl]'
})
export class NavigationControlDirective implements OnDestroy {

    private nativeElement: HTMLElement;
    private _link: string;
    private hasContextMenuListener = false;

    @Input() disableMenuContext: boolean;

    @Input() set wmNavigationControl(val) {
        this._link = val;
        if (val && !this.disableMenuContext) {
            setAttr(this.nativeElement, 'href', val);
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
            this.hasContextMenuListener = false;
        } else {
            setAttr(this.nativeElement, 'href', 'javascript:void(0)');
            this.nativeElement.addEventListener('contextmenu', disableContextMenu);
            this.hasContextMenuListener = true;
        }
    }

    constructor(eleRef: ElementRef) {
        this.nativeElement = eleRef.nativeElement;
    }

    ngOnDestroy() {
        // Remove context menu event listener to prevent memory leak
        if (this.hasContextMenuListener) {
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
        }
    }
}
