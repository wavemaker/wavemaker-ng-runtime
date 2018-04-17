import { Directive, forwardRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './footer.props';

registerProps();

const DEFAULT_CLS = 'app-footer clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-footer', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmFooter]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => FooterDirective)}
    ]
})
export class FooterDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
