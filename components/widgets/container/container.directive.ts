import { Directive, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './container.props';
import { addClass } from '@utils/dom';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';

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

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
