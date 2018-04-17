import { BaseComponent } from '../base/base.component';
import { Component, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../base/framework/styler';
import { getImageUrl } from '../../utils/widget-utils';
import { registerProps } from './navbar.props';
import { IStylableComponent } from '../base/framework/types';

registerProps();

const DEFAULT_CLS = 'navbar navbar-default app-navbar';
const WIDGET_CONFIG = {widgetType: 'wm-navbar', hostClass: DEFAULT_CLS};

declare const _, $;

@Component({
    selector: '[wmNavbar]',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent extends BaseComponent {
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
        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
        this.$navbarContent = $(this.nativeElement).children().find('> #collapse-content');
    }
}
