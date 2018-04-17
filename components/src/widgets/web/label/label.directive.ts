import { Directive, forwardRef, Injector } from '@angular/core';

import { setProperty, toggleClass } from '@wm/utils';

import { IStylableComponent } from '../../framework/types';
import { styler } from '../../framework/styler';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './label.props';

registerProps();

const DEFAULT_CLS = 'app-label';
const WIDGET_CONFIG = {widgetType: 'wm-label', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLabel]',
    providers: [{provide: '@Widget', useExisting: forwardRef(() => LabelDirective)}]
})
export class LabelDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'caption':
                setProperty(this.nativeElement, 'textContent', nv);
                break;
            case 'required':
                toggleClass(this.nativeElement, 'required', nv);
        }
    }
}
