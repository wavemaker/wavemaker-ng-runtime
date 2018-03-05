import { BaseComponent } from '../../widgets/base/base.component';
import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { getImageUrl } from '@utils/utils';
import { registerProps } from './navbar.props';

registerProps();

const DEFAULT_CLS = 'navbar navbar-default app-navbar';
const WIDGET_CONFIG = {widgetType: 'wm-navbar', hostClass: DEFAULT_CLS};

declare const _, $;

@Component({
    selector: '[wmNavbar]',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent extends BaseComponent implements OnInit {
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

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
        this.$navbarContent = $(this.$element).children().find('> #collapse-content');
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
