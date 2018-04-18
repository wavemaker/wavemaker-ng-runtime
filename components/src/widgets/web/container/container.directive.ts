import { Directive, forwardRef, Injector } from '@angular/core';

import { addClass } from '@wm/utils';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './container.props';
import { StylableComponent } from '../base/stylable.component';

registerProps();

const DEFAULT_CLS = 'app-container';
const WIDGET_CONFIG = {widgetType: 'wm-container', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmContainer]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => ContainerDirective)}
    ]
})
export class ContainerDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        addClass(this.nativeElement, DEFAULT_CLS);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
