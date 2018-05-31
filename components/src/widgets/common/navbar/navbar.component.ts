import { Component, Injector, AfterViewInit} from '@angular/core';
import { getResourceURL } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { getImageUrl, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './navbar.props';

registerProps();

const DEFAULT_CLS = 'navbar navbar-default app-navbar';
const WIDGET_CONFIG = {widgetType: 'wm-navbar', hostClass: DEFAULT_CLS};

declare const _, $;

@Component({
    selector: '[wmNavbar]',
    templateUrl: './navbar.component.html',
    providers: [
        provideAsWidgetRef(NavbarComponent)
    ]
})
export class NavbarComponent extends StylableComponent implements AfterViewInit {

    private navContent;

    public _imgSrc;
    public _homeLink;

    private delayToggleNavCollapse() {
        setTimeout(() => this.toggleNavCollapse(), 500);
    }

    private toggleNavCollapse() {
        this.navContent.classList.toggle('in');
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    public toggleCollapse() {
        const $navContent = $(this.navContent);
        $navContent.animate({ 'height': 'toggle'});
        if ($navContent.hasClass('in')) {
            this.delayToggleNavCollapse();
        } else {
            this.toggleNavCollapse();
        }
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'imgsrc':
                this._imgSrc = getImageUrl(nv);
                break;
            case 'homelink':
                this._homeLink = getResourceURL(nv);
                break;
        }
    }

    ngAfterViewInit() {
        this.navContent = this.nativeElement.querySelector('.container-fluid > .navbar-collapse');
    }
}
