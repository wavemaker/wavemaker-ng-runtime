import {AfterViewInit, Component, ElementRef, Injector, Optional, ViewChild} from '@angular/core';

import { APPLY_STYLES_TYPE, styler, StylableComponent, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './navbar.props';
import {UserDefinedExecutionContext} from '@wm/core';

const DEFAULT_CLS = 'navbar navbar-default app-navbar';
const WIDGET_CONFIG = {widgetType: 'wm-navbar', hostClass: DEFAULT_CLS};

declare const $;

@Component({
    selector: '[wmNavbar]',
    templateUrl: './navbar.component.html',
    providers: [
        provideAsWidgetRef(NavbarComponent)
    ]
})
export class NavbarComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    public menuiconclass: any;
    public title: string;
    public imgsrc: string;
    @ViewChild('navContent', {static: true}) private navContent: ElementRef;

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    public toggleCollapse() {
        const $navContent = $(this.navContent.nativeElement);
        $navContent.animate({ 'height': 'toggle'});
        if ($navContent.hasClass('in')) {
            setTimeout(() => this.toggleNavCollapse(), 500);
        } else {
            this.toggleNavCollapse();
        }
    }

    private toggleNavCollapse() {
        this.navContent.nativeElement.classList.toggle('in');
    }
}
