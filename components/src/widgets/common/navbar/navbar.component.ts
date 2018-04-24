import { Component, forwardRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { getImageUrl } from '../../../utils/widget-utils';
import { registerProps } from './navbar.props';

registerProps();

const DEFAULT_CLS = 'navbar navbar-default app-navbar';
const WIDGET_CONFIG = {widgetType: 'wm-navbar', hostClass: DEFAULT_CLS};

declare const _, $;

@Component({
    selector: '[wmNavbar]',
    templateUrl: './navbar.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => NavbarComponent)}
    ]
})
export class NavbarComponent extends StylableComponent {
    imagesrc;

    $navbarContent;

    toggleCollapse() {
        this.$navbarContent.animate({ 'height': 'toggle'});
        if (this.$navbarContent.hasClass('in')) {
            this.delayToggleNavCollapse();
        } else {
            this.toggleNavCollapse();
        }
    }

    delayToggleNavCollapse() {
        setTimeout(() => this.toggleNavCollapse(), 500);
    }

    toggleNavCollapse() {
        this.$navbarContent.toggleClass('in');
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'imgsrc':
                this.imagesrc = getImageUrl(nv);
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.$navbarContent = $(this.nativeElement).children().find('> #collapse-content');
    }
}
