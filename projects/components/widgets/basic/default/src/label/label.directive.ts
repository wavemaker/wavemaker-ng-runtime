import {Directive, Inject, Injector, Optional, SecurityContext} from '@angular/core';

import {setProperty, toggleClass} from '@wm/core';
import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, SanitizePipe } from '@wm/components/base';

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

    constructor(inj: Injector, private sanitizePipe:SanitizePipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this);
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'caption') {
            // Check for trustPipe safe values
            let bindContent = this.nativeElement.getAttribute('caption.bind');
            let safeValue = bindContent ? nv && bindContent.includes('trustAs:') : false;
            if (_.isObject(nv) && !safeValue) {
                setProperty(this.nativeElement, 'textContent', JSON.stringify(nv));
            } else if (_.isObject(nv) && safeValue) {
                setProperty(this.nativeElement, 'innerHTML', nv[Object.keys(nv)[0]]);
            }  else {
                setProperty(this.nativeElement, 'innerHTML', this.sanitizePipe.transform(nv, SecurityContext.HTML));
            }

        } else if (key === 'required') {
            toggleClass(this.nativeElement, 'required', nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
