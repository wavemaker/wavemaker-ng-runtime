import { Directive, forwardRef, Injector } from '@angular/core';

import { addClass } from '@wm/utils';

import { IStylableComponent } from '../base/framework/types';
import { APPLY_STYLES_TYPE, styler } from '../base/framework/styler';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './container.props';

registerProps();

const DEFAULT_CLS = 'app-container';
const WIDGET_CONFIG = {widgetType: 'wm-container', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmContainer]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => ContainerDirective)}
    ]
})
export class ContainerDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        addClass(this.nativeElement, DEFAULT_CLS);
        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
