import { BaseComponent } from '../../widgets/base/base.component';
import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { getImageUrl } from '@utils/utils';
import { registerProps } from './navbar.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-navbar', hasTemplate: true};

@Component({
    selector: 'wm-navbar',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent extends BaseComponent {
    imagesrc;

    onPropertyChange(key, nv, ov) {
        switch(key) {
            case 'imgsrc':
                this.imagesrc = getImageUrl(nv);
                break;
        }
    }


    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit() {
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}