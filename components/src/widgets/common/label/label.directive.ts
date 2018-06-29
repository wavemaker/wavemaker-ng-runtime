import { Directive, Injector, SecurityContext } from '@angular/core';

import { setProperty, toggleClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './label.props';
import { StylableComponent } from '../base/stylable.component';
import { DISPLAY_TYPE } from '../../framework/constants';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';

registerProps();

const DEFAULT_CLS = 'app-label';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-label',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Directive({
    selector: '[wmLabel]',
    providers: [
        provideAsWidgetRef(LabelDirective)
    ]
})
export class LabelDirective extends StylableComponent {

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'caption') {
            setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(nv, SecurityContext.HTML));
        } else if (key === 'required') {
            toggleClass(this.nativeElement, 'required', nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
