import { Directive, Injector, Input, SecurityContext } from '@angular/core';

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
    ]
})
export class LabelDirective extends StylableComponent {
    @Input() caption;

    static initializeProps = registerProps();

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
    ngOnInit() {
        if (_.isObject(this.caption)) {
            setProperty(this.nativeElement, 'textContent', JSON.stringify(this.caption));
        } else {
            setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(this.caption, SecurityContext.HTML));
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'required') {
            toggleClass(this.nativeElement, 'required', nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
