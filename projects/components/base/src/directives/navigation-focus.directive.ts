import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationFocusService } from '@wm/core';

@Directive({
    standalone: true,
    selector: '[focusOnNavigation]'
})
export class NavigationFocusDirective implements OnInit, OnDestroy {
    @Input('focusOnNavigation') focusTarget!: string;
    @HostBinding('tabindex') readonly tabindex = '-1';
    private focusableEle: HTMLElement | null = null;

    constructor(
        private el: ElementRef,
        private navigationFocusService: NavigationFocusService
    ) {}

    private initializeFocus(): void {
        if (!this.focusTarget || this.focusTarget === 'DEFAULT') {
            return;
        }

        if (this.focusTarget === 'BODY') {
            this.focusableEle = document.body;
        } else if (this.focusTarget === 'PAGE_CONTENT') {
            this.focusableEle =  this.el.nativeElement.hasAttribute('wmspapage') ? this.el.nativeElement : this.el.nativeElement.querySelector('[wmpagecontent]')
        }

        if (this.focusableEle) {
            this.focusableEle.setAttribute('tabindex', '-1');
            this.navigationFocusService.requestFocusOnNavigation(this.focusableEle);
        }
    }

    ngOnInit(): void {
        this.initializeFocus();
    }

    ngOnDestroy(): void {
        if (this.focusableEle) {
            this.navigationFocusService.releaseFocusOnNavigation(this.focusableEle);
        }
    }
}
