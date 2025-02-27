import {Directive, ElementRef, HostBinding, OnDestroy} from '@angular/core';
import {NavigationFocusService} from '@wm/core';

@Directive({
    standalone: true,
    selector: '[focusOnNavigation]',
})
export class NavigationFocusDirective implements OnDestroy {
    @HostBinding('tabindex') readonly tabindex = '-1';

    constructor(private el: ElementRef, private navigationFocusService: NavigationFocusService) {
        this.navigationFocusService.requestFocusOnNavigation(el.nativeElement);
    }

    ngOnDestroy() {
        this.navigationFocusService.releaseFocusOnNavigation(this.el.nativeElement);
    }
}
