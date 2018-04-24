import { Directive, forwardRef, Injector } from '@angular/core';

import { setProperty, toggleClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { registerProps } from './label.props';
import { StylableComponent } from '../base/stylable.component';

registerProps();

const DEFAULT_CLS = 'app-label';
const WIDGET_CONFIG = {widgetType: 'wm-label', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLabel]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => LabelDirective)}
    ]
})
export class LabelDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
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
