import {Directive, Inject, Injector, Optional} from '@angular/core';

import {addClass} from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './container.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import {BaseContainerComponent} from "../base/base-container.component";

const DEFAULT_CLS = 'app-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-container',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmContainer]',
    standalone: false,
    providers: [
        provideAsWidgetRef(ContainerDirective)
    ]
})
export class ContainerDirective extends BaseContainerComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext?: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        addClass(this.nativeElement, DEFAULT_CLS);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
