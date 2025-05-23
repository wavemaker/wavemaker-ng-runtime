import {ContentChild, Directive, HostListener, Injector, AfterViewInit, Optional, Inject} from '@angular/core';

import {addClass, removeClass} from '@wm/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { AnchorComponent } from '@wm/components/basic';

import { registerProps } from './nav-item.props';

declare const $;

const DEFAULT_CLS = 'app-nav-item';
const WIDGET_CONFIG = {widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS};

@Directive({
  standalone: true,
    selector: '[wmNavItem]',
    exportAs: 'navItemRef',
    providers: [
        provideAsWidgetRef(NavItemDirective)
    ]
})
export class NavItemDirective extends StylableComponent implements AfterViewInit{
    static initializeProps = registerProps();
    @ContentChild(AnchorComponent) innerLink;

    @HostListener('click')
    @HostListener('keydown.enter')
    makeActive() {
        const parentNode = this.nativeElement.parentNode;
        $(parentNode as HTMLElement).find('> li.active').removeClass('active');
        if (this.isAttached) {
            addClass(this.nativeElement, 'active');
        }
    }

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    public ngAfterViewInit() {
        if (this.innerLink) {
            this.innerLink.onActive(() => this.makeActive());
        }
    }

    public ngOnDetach() {
        removeClass(this.nativeElement, 'active', true);
        super.ngOnDetach();
    }
}
