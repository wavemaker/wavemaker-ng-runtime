import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './header.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-header clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-header', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmHeader]',
    templateUrl: './header.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => HeaderComponent)}
    ]
})
export class HeaderComponent extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
