import { Directive, Injector, SecurityContext } from '@angular/core';

import { setProperty, toggleClass } from '@wm/core';
import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, TrustAsPipe } from '@wm/components/base';

import { registerProps } from './label.props';

declare const _;

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
    ],
    exportAs: 'wmLabel'
})
export class LabelDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'caption') {
            if (_.isObject(nv)) {
                setProperty(this.nativeElement, 'textContent', JSON.stringify(nv));
            } else {
                setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(nv, SecurityContext.HTML));
            }

        } else if (key === 'required') {
            toggleClass(this.nativeElement, 'required', nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
