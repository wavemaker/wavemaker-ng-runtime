import {Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit} from '@angular/core';
import {NavigationFocusService} from '@wm/core';

@Directive({
    selector: '[focusOnNavigation]',
})
export class NavigationFocusDirective implements OnDestroy, OnInit {
    @Input('focusOnNavigation') focusOnNavigation = false;
    @HostBinding('tabindex') readonly tabindex = '-1';

    constructor(private el: ElementRef, private navigationFocusService: NavigationFocusService) {
    }

    ngOnDestroy() {
        this.navigationFocusService.releaseFocusOnNavigation(this.el.nativeElement);
    }

    ngOnInit(): void {
        if (this.focusOnNavigation) {
            this.navigationFocusService.requestFocusOnNavigation(this.el.nativeElement);
        }
    }
}
