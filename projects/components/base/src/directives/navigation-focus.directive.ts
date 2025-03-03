import { Directive, ElementRef, HostBinding, OnDestroy } from '@angular/core';
import { NavigationFocusService, getWmProjectProperties } from '@wm/core';

@Directive({
    selector: '[focusOnNavigation]'
})
export class NavigationFocusDirective implements OnDestroy {
    @HostBinding('tabindex') readonly tabindex = '-1';
    private focusableEle: HTMLElement | null = null;
    private readonly pageFocus: string | undefined = getWmProjectProperties().pageFocus;

    constructor(
        private el: ElementRef,
        private navigationFocusService: NavigationFocusService
    ) {
        this.initializeFocus();
    }

    private initializeFocus(): void {
        if (!this.pageFocus || this.pageFocus === 'DEFAULT') {
            return;
        }

        if (this.pageFocus === 'BODY') {
            document.body.setAttribute('tabindex', '-1');
            this.focusableEle = document.body;
        } else if (this.pageFocus === 'PAGE_CONTENT') {
            this.focusableEle = this.el.nativeElement;
        }

        if (this.focusableEle) {
            this.navigationFocusService.requestFocusOnNavigation(this.focusableEle);
        }
    }

    ngOnDestroy(): void {
        if (this.focusableEle) {
            this.navigationFocusService.releaseFocusOnNavigation(this.focusableEle);
        }
    }
}
