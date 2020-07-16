import { ContentChild, Directive, HostListener, Injector, AfterViewInit } from '@angular/core';

import { addClass } from '@wm/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { AnchorComponent } from '@wm/components/basic';

import { registerProps } from './nav-item.props';

declare const $;

const DEFAULT_CLS = 'app-nav-item';
const WIDGET_CONFIG = {widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmNavItem]',
    providers: [
        provideAsWidgetRef(NavItemDirective)
    ]
})
export class NavItemDirective extends StylableComponent implements AfterViewInit{
    static initializeProps = registerProps();
    @ContentChild(AnchorComponent, /* TODO: add static flag */ {static: false}) innerLink;

    @HostListener('click')
    @HostListener('keydown.enter')
    makeActive() {
        const parentNode = this.nativeElement.parentNode;
        $(parentNode as HTMLElement).find('> li.active').removeClass('active');
        addClass(this.nativeElement, 'active');
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    public ngAfterViewInit() {
        if (this.innerLink) {
            this.innerLink.onActive(() => this.makeActive());
        }
    }
}
